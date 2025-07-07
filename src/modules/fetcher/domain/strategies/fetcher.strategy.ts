import { AxiosError } from 'axios'
import { format } from 'date-fns'
import { UnprocessableEntity } from '../../../../common/exceptions/unprocessable-entity'
import { isEmpty, isNotEmpty, not, throwIf } from '../../../../common/helpers/helper'
import { Notification } from '../../../../common/notification/domain/notification'
import { History, HistoryExtra, HistoryType } from '../../../history/domain/history'
import { HistoryService } from '../../../history/domain/history-service'
import { ImporterStrategy } from '../../../importer/domain/strategies/importer.strategy'
import { Log } from '../../../log/domain/log'
import { LogService } from '../../../log/domain/log-service'
import { Resource } from '../../../resource/domain/resource'
import { ResourceService } from '../../../resource/domain/resource-service'
import {
    Connection,
    ConnectionStatus,
    FetcherConnection,
    ImporterConnection
} from '../../../setting/domain/connection/connection'
import { isImporter } from '../../../setting/domain/connection/connection-helper'
import { ConnectionService } from '../../../setting/domain/connection/connection-service'
import { Setting } from '../../../setting/domain/setting'
import { UserType } from '../../../user/domain/user'
import { UserService } from '../../../user/domain/user-service'

export abstract class FetcherStrategy<F extends FetcherConnection = any> {
    protected readonly connectionService = ConnectionService.getInstance()
    protected readonly resourceService = ResourceService.getInstance()
    protected readonly logService = LogService.getInstance()

    protected readonly importers: ImporterStrategy[] = []

    constructor(protected setting: Setting, protected fetcher: F) {}

    async fetch(): Promise<void> {
        throwIf(not(this.fetcher.active), UnprocessableEntity, 'fetcher', { active: true })
        throwIf(this.fetcher.status === ConnectionStatus.IN_PROGRESS, UnprocessableEntity, 'fetcher', {
            status: [ConnectionStatus.DONE, ConnectionStatus.FAILED]
        })

        const byImporter = (connection: Connection) => connection.active && isImporter(connection)
        const targets = this.setting.connections.filter(byImporter) as ImporterConnection[]

        if (isEmpty(targets)) return

        await this.connectionService.update({ id: this.fetcher.id, status: ConnectionStatus.IN_PROGRESS } as Connection)

        const started_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        let [created, updated, errors] = [0, 0, 0]

        let page = 1
        let shouldContinue = true

        do {
            let resources: Resource[]
            let hasNextPage = false

            try {
                const response = await this.fetchDataBy(targets, page)
                resources = response.resources
                hasNextPage = response.hasNextPage
            } catch (e) {
                await Promise.all([
                    this.log(e),
                    this.connectionService.update({ id: this.fetcher.id, status: ConnectionStatus.FAILED } as Connection)
                ])
                break
            }

            const toCreateOrUpdate = async (resource: Resource) => {
                try {
                    if (isNotEmpty(resource.id)) {
                        await this.resourceService.update(resource)
                        updated++
                    } else {
                        await this.resourceService.create(resource)
                        created++
                    }
                } catch (e) {
                    errors++
                    await this.log(e, resource)
                }
            }
            await Promise.all(resources.map(toCreateOrUpdate))

            page++
            shouldContinue = hasNextPage
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
            subject: 'Busca de produtos concluída!',
            templatePath: 'import-concluded',
            context: await this.createHistory(started_at, { created, updated, errors })
        })

        await this.connectionService.update({ id: this.fetcher.id, status: ConnectionStatus.DONE } as Connection)
    }

    abstract fetchOne(resource: Resource): Promise<Resource>

    protected abstract fetchDataBy(
        targets: ImporterConnection[],
        page: number
    ): Promise<{ resources: Resource[]; hasNextPage: boolean }>

    protected async log(e: Error, resource?: Resource): Promise<void> {
        const message = e instanceof AxiosError ? e.response.data : { message: e.message, stack: e.stack }
        const connection_id = this.fetcher.id
        const resource_id = resource?.id
        await this.logService.create({ message, connection_id, resource_id } as Log)
    }

    private async createHistory(started_at: string, extra: HistoryExtra): Promise<History> {
        const history: History = {
            api: this.fetcher.api,
            type: HistoryType.FETCH,
            started_at,
            ended_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            extra
        } as History

        return await HistoryService.getInstance().create(history)
    }
}
