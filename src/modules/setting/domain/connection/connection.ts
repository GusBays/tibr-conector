import { Filter, Model, Timestamps } from '../../../../common/contracts/contracts'
import { SettingBelongs } from '../setting'

export interface Connection extends Model, SettingBelongs, Timestamps {
    type: ConnectionType
    api: ConnectionApi
    config: Record<string, any>
    active: boolean
}

export interface FetcherConnection extends Connection {
    type: ConnectionType.FETCHER
}

export interface ImporterConnection extends Connection {
    type: ConnectionType.IMPORTER
}

export enum ConnectionType {
    FETCHER = 'fetcher',
    IMPORTER = 'importer'
}

export enum ConnectionApi {
    AGIS = 'agis',
    BAGY = 'bagy'
}

export interface ConnectionFilter extends Partial<Model>, Partial<SettingBelongs>, Filter {
    type?: ConnectionType
    api?: ConnectionApi
}

export enum ConnectionTypeEnum {
    SERVICE = 'ConnectionService',
    REPOSITORY = 'ConnectionRepository'
}
