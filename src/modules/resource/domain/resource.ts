import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { ConnectionApi } from '../../setting/domain/connection/connection'

export interface Resource extends Model, Timestamps {
    type: ResourceType
    source: ConnectionApi
    source_id: number
    source_payload: Record<string, any>
    target: ConnectionApi
    target_id: number
    target_payload: Record<string, any>
}

export interface ResourceFilter extends Partial<Model>, Filter {
    source?: string
    source_id?: number
    target?: string
    target_id?: number
    type?: ResourceType
    with_stock_on_agis?: boolean
}

export enum ResourceType {
    PRODUCT = 'product'
}

export enum ResourceTypeEnum {
    SERVICE = 'ResourceService',
    REPOSITORY = 'ResourceRepository'
}
