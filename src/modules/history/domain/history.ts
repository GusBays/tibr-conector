import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'

export interface History extends Model, Timestamps {
    type: HistoryType
    source: string
    target: string
    started_at: string
    ended_at: string
    extra: Record<string, any>
}

export enum HistoryType {
    PRODUCT = 'product'
}

export interface ProductHistory {
    type: HistoryType.PRODUCT
    extra: {
        success: number
        error: number
    }
}

export interface HistoryFilter extends Partial<Model>, Filter {}

export enum HistoryTypeEnum {
    SERVICE = 'HistoryService',
    REPOSITORY = 'HistoryRepository'
}
