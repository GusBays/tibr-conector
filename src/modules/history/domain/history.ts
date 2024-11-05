import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { ConnectionApi } from '../../setting/domain/connection/connection'

export interface History extends Model, Timestamps {
    type: HistoryType
    connection: ConnectionApi
    started_at: string
    ended_at: string
    extra: {
        success: number
        errors: number
    }
}

export enum HistoryType {
    FETCH = 'fetch',
    IMPORT = 'import'
}

export interface FetchHistory extends History {
    type: HistoryType.FETCH
}

export interface ImportHistory extends History {
    type: HistoryType.IMPORT
}

export interface HistoryFilter extends Partial<Model>, Filter {}

export enum HistoryTypeEnum {
    SERVICE = 'HistoryService',
    REPOSITORY = 'HistoryRepository'
}
