import { Filter, Model, Timestamps } from '../../../../common/contracts/contracts'
import { ResourceType } from '../../../resource/domain/resource'
import { SettingBelongs } from '../setting'

export interface Connection<T = any> extends Model, SettingBelongs, Timestamps {
    type: ConnectionType
    api: ConnectionApi
    config: T
    status: ConnectionStatus
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

export interface ConnectionBelongs {
    connection_id: number
}

export interface ConnectionFilter extends Partial<Model>, Partial<SettingBelongs>, Filter {
    type?: ConnectionType
    api?: ConnectionApi
    resource?: ResourceType
    status?: ConnectionStatus
}

export enum ConnectionStatus {
    DONE = 'done',
    IN_PROGRESS = 'in_progress'
}

export enum ConnectionTypeEnum {
    SERVICE = 'ConnectionService',
    REPOSITORY = 'ConnectionRepository'
}
