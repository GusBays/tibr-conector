import { format } from 'date-fns'
import { isEmpty, not } from '../../../common/helpers/helper'
import { FetchHistory, HistoryType } from '../../history/domain/history'
import { HistoryService } from '../../history/domain/history-service'
import { Resource, ResourceFilter, ResourceType } from '../../resource/domain/resource'
import { ResourceService } from '../../resource/domain/resource-service'
import { Connection, ConnectionApi, FetcherConnection, ImporterConnection } from '../../setting/domain/connection/connection'
import { isImporter } from '../../setting/domain/connection/connection-helper'
import { Setting } from '../../setting/domain/setting'

export abstract class Fetcher<F extends FetcherConnection = any> {
    protected resourceService = ResourceService.getInstance()
    protected historyService = HistoryService.getInstance()

    constructor(protected setting: Setting, protected fetcher: F) {}

    async fetch(): Promise<void> {
        if (not(this.fetcher.active)) return

        const targets = this.getTargets()

        if (isEmpty(targets)) return

        const history: FetchHistory = {
            id: null,
            connection: this.fetcher.api,
            type: HistoryType.FETCH,
            started_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            ended_at: null,
            extra: {
                created: 0,
                updated: 0,
                errors: 0
            },
            created_at: null,
            updated_at: null
        }

        const resources = await this.fetchDataBy(targets)

        if (isEmpty(resources)) return

        const toCreateOrUpdate = async (resource: Resource) => {
            const isCreation = isEmpty(resource.id)

            try {
                if (isCreation) {
                    await this.resourceService.create(resource)
                    history.extra.created++
                } else {
                    await this.resourceService.update(resource)
                    history.extra.updated++
                }
            } catch (e) {
                history.extra.errors++
            }
        }
        await Promise.all(resources.map(toCreateOrUpdate))

        history.ended_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.historyService.create(history)
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

    private getTargets(): ImporterConnection[] {
        const byActive = (connection: Connection) => connection.active
        const byImporter = (connection: Connection) => isImporter(connection)
        return this.setting.connections.filter(byActive).filter(byImporter)
    }
}
