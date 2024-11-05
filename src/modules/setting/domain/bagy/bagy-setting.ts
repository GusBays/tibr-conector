import { Setting, SettingConnection } from '../setting'

export interface BagySetting extends Setting {
    connection: SettingConnection.BAGY
    config: BagySettingConfig
}

export interface BagySettingConfig {
    token: string
}
