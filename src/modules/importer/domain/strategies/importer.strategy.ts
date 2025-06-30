import { AxiosError } from 'axios'
import { format } from 'date-fns'
import { UnprocessableEntity } from '../../../../common/exceptions/unprocessable-entity'
import { isEmpty, not, throwIf } from '../../../../common/helpers/helper'
import { Notification } from '../../../../common/notification/domain/notification'
import { FetchHistory, History, HistoryExtra, HistoryType } from '../../../history/domain/history'
import { HistoryService } from '../../../history/domain/history-service'
import { Log } from '../../../log/domain/log'
import { LogService } from '../../../log/domain/log-service'
import { ProductUpdate, Resource } from '../../../resource/domain/resource'
import { isProductResource } from '../../../resource/domain/resource-helper'
import { ResourceService } from '../../../resource/domain/resource-service'
import {
    Connection,
    ConnectionApi,
    ConnectionStatus,
    ImporterConnection
} from '../../../setting/domain/connection/connection'
import { ConnectionService } from '../../../setting/domain/connection/connection-service'
import { Setting } from '../../../setting/domain/setting'
import { UserType } from '../../../user/domain/user'
import { UserService } from '../../../user/domain/user-service'

export abstract class ImporterStrategy<I extends ImporterConnection = any> {
    abstract readonly api: ConnectionApi

    private readonly connectionService = ConnectionService.getInstance()
    private readonly logService = LogService.getInstance()
    private readonly resourceService = ResourceService.getInstance()

    constructor(protected setting: Setting, protected importer: I) {}

    async import(): Promise<void> {
        throwIf(not(this.importer.active), UnprocessableEntity, 'importer', { active: true })
        throwIf(this.importer.status !== ConnectionStatus.DONE, UnprocessableEntity, 'importer', {
            status: ConnectionStatus.DONE
        })

        await this.connectionService.update({ id: this.importer.id, status: ConnectionStatus.IN_PROGRESS } as Connection)

        const started_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        let [created, updated, errors] = [0, 0, 0]

        let page = 1
        let shouldContinue = true

        do {
            const { data: resources, meta } = await this.resourceService.getPaginate({ page, limit: 50 })

            if (isEmpty(resources)) break

            const toImport = async (resource: Resource) => {
                if (isProductResource(resource) && ProductUpdate.DISABLED === resource.config.update) return

                const isCreation = isEmpty(resource.target_id)

                try {
                    const imported = await this.importOne(resource)

                    await this.resourceService.update(imported)

                    if (isCreation) created++
                    else updated++
                } catch (e) {
                    errors++
                    await this.log(e, resource)
                }
            }
            await Promise.all(resources.map(toImport))

            page++
            shouldContinue = meta.current_page < meta.last_page
        } while (shouldContinue)

        const users = await UserService.getInstance().getAll({ active: true })

        let to: string
        let cc: string[] = []

        for (const user of users) {
            if (UserType.OWNER === user.type) to = user.email
            else cc.push(user.email)
        }

        await Notification.send({
            to,
            cc,
            subject: 'Importação de produtos concluída!',
            templatePath: 'import-concluded',
            context: await this.createHistory(started_at, { created, updated, errors })
        })

        await this.connectionService.update({ id: this.importer.id, status: ConnectionStatus.DONE } as Connection)
    }

    abstract importOne(resource: Resource): Promise<Resource>
    abstract deleteImage(targetId: number, imageId: number): Promise<void>

    protected async log(e: Error, resource?: Resource, payload?: Record<string, any>): Promise<void> {
        const message = e instanceof AxiosError ? e.response.data : { message: e.message, stack: e.stack }
        const connection_id = this.importer.id
        const resource_id = resource?.id
        await this.logService.create({ message, connection_id, resource_id, payload } as Log)
    }

    private async createHistory(started_at: string, extra: HistoryExtra): Promise<History> {
        const history: FetchHistory = {
            id: null,
            connection: this.importer.api,
            type: HistoryType.FETCH,
            started_at,
            ended_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            extra,
            created_at: null,
            updated_at: null
        }
        return await HistoryService.getInstance().create(history)
    }
}
