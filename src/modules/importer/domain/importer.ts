import { format, subDays } from 'date-fns'
import { HistoryService } from '../../history/domain/history-service'
import { Resource, ResourceFilter, ResourceType } from '../../resource/domain/resource'
import { ResourceService } from '../../resource/domain/resource-service'
import { ImporterConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'
import { SettingService } from '../../setting/domain/setting-service'

export abstract class Importer<I extends ImporterConnection = any> {
    protected resourceService = ResourceService.getInstance()
    protected settingService = SettingService.getInstance()
    protected historyService = HistoryService.getInstance()

    constructor(protected setting: Setting, protected importer: I) {}

    abstract import(): Promise<void>

    protected async getResourcesBy<T extends Resource>(type: ResourceType): Promise<T[]> {
        const yesterday = subDays(new Date(), 1)

        const filter: ResourceFilter = {
            target: this.importer.api,
            type,
            updated_after: format(yesterday, 'yyyy-MM-dd HH:mm:ss')
        }

        const res = await this.resourceService.getAll(filter)
        return res as T[]
    }
}
