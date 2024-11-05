import { format } from 'date-fns'
import { not } from '../../../common/helpers/helper'
import { FetchHistory, HistoryType } from '../../history/domain/history'
import { HistoryService } from '../../history/domain/history-service'
import { Resource } from '../../resource/domain/resource'
import { ResourceService } from '../../resource/domain/resource-service'
import { FetcherConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'

export abstract class Fetcher<F extends FetcherConnection = any> {
    protected resourceService = ResourceService.getInstance()
    protected historyService = HistoryService.getInstance()

    constructor(protected setting: Setting, protected fetcher: F) {}

    async fetch(): Promise<void> {
        if (not(this.fetcher.active)) return

        const history: FetchHistory = {
            id: null,
            connection: this.fetcher.api,
            type: HistoryType.FETCH,
            started_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            ended_at: null,
            extra: {
                success: 0,
                errors: 0
            },
            created_at: null,
            updated_at: null
        }

        const resources = await this.getData()

        const toCreate = async (resource: Resource) => {
            try {
                await this.resourceService.create(resource)
                history.extra.success++
            } catch (e) {
                history.extra.errors++
            }
        }
        await Promise.all(resources.map(toCreate))

        history.ended_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.historyService.create(history)
    }

    protected abstract getData(): Promise<Resource[]>
}
