import { HistoryService } from '../../history/domain/history-service'
import { ResourceService } from '../../resource/domain/resource-service'
import { Setting } from '../../setting/domain/setting'
import { SettingService } from '../../setting/domain/setting-service'

export abstract class Importer<S extends Setting = any> {
    protected resourceService = ResourceService.getInstance()
    protected settingService = SettingService.getInstance()
    protected historyService = HistoryService.getInstance()

    constructor(protected setting: S) {}

    abstract import(): Promise<void>
}
