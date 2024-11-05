import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'

export interface Setting extends Model, Timestamps {
    connection: SettingConnection
    type: SettingType
    config: Record<string, any>
    active: boolean
}

export interface FetcherSetting extends Setting {
    type: SettingType.FETCHER
}

export interface ImporterSetting extends Setting {
    type: SettingType.IMPORTER
}

export enum SettingConnection {
    AGIS = 'agis',
    BAGY = 'bagy'
}

export enum SettingType {
    FETCHER = 'fetcher',
    IMPORTER = 'importer'
}

export interface SettingFilter extends Partial<Model>, Filter {
    connection?: SettingConnection
    active?: boolean
    type?: SettingType
}

export enum SettingTypeEnum {
    SERVICE = 'SettingService',
    REPOSITORY = 'SettingRepository'
}
