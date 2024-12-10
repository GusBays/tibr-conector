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
import { User, UserType } from '../../user/domain/user'
import { UserService } from '../../user/domain/user-service'

export abstract class Fetcher<F extends FetcherConnection = any> {
    protected resourceService = ResourceService.getInstance()
    protected historyService = HistoryService.getInstance()
    protected logService = LogService.getInstance()

    protected importers: Importer[] = []

    constructor(protected setting: Setting, protected fetcher: F) {}

    async fetch(): Promise<void> {
        if (not(this.fetcher.active)) return

        const byImporter = (connection: Connection) => connection.active && isImporter(connection)
        const targets = this.setting.connections.filter(byImporter) as ImporterConnection[]

        if (isEmpty(targets)) return

        const stated_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        let [created, updated, errors] = [0, 0, 0]

        const resources = await this.fetchDataBy(targets)

        if (isEmpty(resources)) return

        const importToTarget = async (resource: Resource) => {
            const allowedToImport = false === isProductResource(resource) || resource.config.allowed_to_import
            const isCreation = isEmpty(resource.target_id)

            if (allowedToImport) {
                try {
                    const importer = this.getImporterBy(resource, targets)
                    await importer.importOne(resource)

                    if (isCreation) created++
                    else updated++
                } catch (e) {
                    errors++
                }
            }

            isEmpty(resource.id) ? await this.resourceService.create(resource) : await this.resourceService.update(resource)
        }
        await Promise.all(resources.map(importToTarget))

        const history = await this.createHistory(stated_at, { created, updated, errors })

        const users = await UserService.getInstance().getAll({ active: true })

        const byOwner = (user: User) => UserType.OWNER === user.type
        const to = users.find(byOwner)?.email

        const byNotOwner = (user: User) => UserType.OWNER !== user.type
        const toEmail = (user: User) => user.email
        const cc = users.filter(byNotOwner).map(toEmail).join(',')

        await Notification.send({
            to,
            cc,
            subject: 'Importação de produtos concluída!',
            templatePath: 'import-concluded',
            context: history
        })
    }

    protected abstract fetchDataBy(targets: ImporterConnection[]): Promise<Resource[]>

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
