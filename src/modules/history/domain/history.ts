import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { ConnectionApi } from '../../setting/domain/connection/connection'

export interface History extends Model, Timestamps {
    type: HistoryType
    api: ConnectionApi
    started_at: string
    ended_at: string
    extra: HistoryExtra
}

export interface HistoryExtra {
    created: number
    updated: number
    errors: number
}

export enum HistoryType {
    FETCH = 'fetch',
    IMPORT = 'import'
}

export interface HistoryFilter extends Partial<Model>, Filter {}

export enum HistoryTypeEnum {
    SERVICE = 'HistoryService',
    REPOSITORY = 'HistoryRepository'
}
