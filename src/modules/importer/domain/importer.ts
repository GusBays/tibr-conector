import { HistoryService } from '../../history/domain/history-service'
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
}
