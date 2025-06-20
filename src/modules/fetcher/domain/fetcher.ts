import { AxiosError } from 'axios'
import { format } from 'date-fns'
import { isEmpty, isNotEmpty, not } from '../../../common/helpers/helper'
import { Notification } from '../../../common/notification/domain/notification'
import { FetchHistory, History, HistoryExtra, HistoryType } from '../../history/domain/history'
import { HistoryService } from '../../history/domain/history-service'
import { Importer } from '../../importer/domain/importer'
import { ImporterFactory } from '../../importer/domain/importer-factory'
import { Log } from '../../log/domain/log'
import { LogService } from '../../log/domain/log-service'
import { Resource, ResourceFilter, ResourceType } from '../../resource/domain/resource'
import { isProductResource } from '../../resource/domain/resource-helper'
import { ResourceService } from '../../resource/domain/resource-service'
import { Connection, ConnectionApi, FetcherConnection, ImporterConnection } from '../../setting/domain/connection/connection'
import { isImporter } from '../../setting/domain/connection/connection-helper'
import { Setting } from '../../setting/domain/setting'
import { UserType } from '../../user/domain/user'
import { UserService } from '../../user/domain/user-service'

export abstract class Fetcher<F extends FetcherConnection = any> {
    protected readonly resourceService = ResourceService.getInstance()
    protected readonly historyService = HistoryService.getInstance()
    protected readonly logService = LogService.getInstance()

    protected readonly importers: Importer[] = []

    constructor(protected setting: Setting, protected fetcher: F) {}

    async fetch(): Promise<void> {
        if (not(this.fetcher.active)) return

        const byImporter = (connection: Connection) => connection.active && isImporter(connection)
        const targets = this.setting.connections.filter(byImporter) as ImporterConnection[]

        if (isEmpty(targets)) return

        const stated_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        let [created, updated, errors] = [0, 0, 0]

        const importToTarget = async (resource: Resource) => {
            const allowedToImport = false === isProductResource(resource) || resource.config.allowed_to_import

            if (not(allowedToImport)) return resource

            try {
                await this.getImporterBy(resource, targets).importOne(resource)

                if (isEmpty(resource.target_id)) created++
                else updated++
            } catch (e) {
                this.log(e)
                errors++
            } finally {
                return resource
            }
        }

        let page = 1
        let shouldContinue = true

        while (shouldContinue) {
            const { resources, hasNextPage } = await this.fetchDataBy(targets, page)

            if (isEmpty(resources)) break

            const imported = await Promise.all(resources.map(importToTarget))

            await this.resourceService.insert(imported)

            page++
            shouldContinue = hasNextPage
        }

        const users = await UserService.getInstance().getAll({ active: true })

        let to: string
        let cc: string[] = []

        for (const user of users) {
            if (UserType.OWNER === user.type) {
                to = user.email
            } else {
                cc.push(user.email)
            }
        }

        await Notification.send({
            to,
            cc,
            subject: 'Importação de produtos concluída!',
            templatePath: 'import-concluded',
            context: await this.createHistory(stated_at, { created, updated, errors })
        })
    }

    protected abstract fetchDataBy(
        targets: ImporterConnection[],
        page: number
    ): Promise<{ resources: Resource[]; hasNextPage: boolean }>

    protected async getResourceBy<T extends Resource>(
        source_id: number,
        target: ConnectionApi,
        type: ResourceType
    ): Promise<T> {
        const filter: ResourceFilter = {
            source: this.fetcher.api,
            source_id,
            target,
            type
        }

        try {
            const res = await this.resourceService.getOne(filter)
            return res as T
        } catch (e) {}
    }

    private getImporterBy(resource: Resource, activeImporters: Connection[]): Importer {
        const byApi = (connection: { api: ConnectionApi }) => connection.api === resource.target
        let importer = this.importers.find(byApi)

        if (isNotEmpty(importer)) return importer

        const connection = activeImporters.find(byApi) as ImporterConnection

        importer = ImporterFactory.getInstance(resource.type, this.setting, connection)
        this.importers.push(importer)

        return importer
    }

    protected async log(e: Error, resource?: Resource): Promise<void> {
        const message = e instanceof AxiosError ? e.response.data : { message: e.message, stack: e.stack }
        const connection_id = this.fetcher.id
        const resource_id = resource.id
        await this.logService.create({ message, connection_id, resource_id } as Log)
    }

    private async createHistory(started_at, extra: HistoryExtra): Promise<History> {
        const history: FetchHistory = {
            id: null,
            connection: this.fetcher.api,
            type: HistoryType.FETCH,
            started_at,
            ended_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            extra,
            created_at: null,
            updated_at: null
        }
        return await this.historyService.create(history)
    }
}
