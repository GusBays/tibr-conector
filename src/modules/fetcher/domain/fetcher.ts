import { format } from 'date-fns'
import { isEmpty, isNotEmpty, not } from '../../../common/helpers/helper'
import { FetchHistory, HistoryExtra, HistoryType } from '../../history/domain/history'
import { HistoryService } from '../../history/domain/history-service'
import { Importer } from '../../importer/domain/importer'
import { ImporterFactory } from '../../importer/domain/importer-factory'
import { Resource, ResourceFilter, ResourceType } from '../../resource/domain/resource'
import { ResourceService } from '../../resource/domain/resource-service'
import { Connection, ConnectionApi, FetcherConnection, ImporterConnection } from '../../setting/domain/connection/connection'
import { isImporter } from '../../setting/domain/connection/connection-helper'
import { Setting } from '../../setting/domain/setting'

export abstract class Fetcher<F extends FetcherConnection = any> {
    protected resourceService = ResourceService.getInstance()
    protected historyService = HistoryService.getInstance()

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
            const importer = this.getImporterBy(resource, targets)

            if (isEmpty(importer)) return

            const isCreation = isEmpty(resource.target_id)

            try {
                await importer.importOne(resource)

                if (isCreation) created++
                else updated++

                isEmpty(resource.id)
                    ? await this.resourceService.create(resource)
                    : await this.resourceService.update(resource)
            } catch (e) {
                errors++
            }
        }
        await Promise.all(resources.map(importToTarget))

        await this.createHistory(stated_at, { created, updated, errors })
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

    private getImporterBy(resource: Resource, activeImporters: Connection[]): Importer | null {
        const byApi = (connection: { api: ConnectionApi }) => connection.api === resource.target
        let importer = this.importers.find(byApi)

        if (isNotEmpty(importer)) return importer

        const connection = activeImporters.find(byApi) as ImporterConnection

        importer = ImporterFactory.getInstance(resource.type, this.setting, connection)
        this.importers.push(importer)

        return importer
    }

    private async createHistory(started_at, extra: HistoryExtra): Promise<void> {
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
        await this.historyService.create(history)
    }
}
