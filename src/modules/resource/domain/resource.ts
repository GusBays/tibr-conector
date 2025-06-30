import { UUID } from 'crypto'
import { Dimensions, Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { ConnectionApi } from '../../setting/domain/connection/connection'

export interface Resource<T = any> extends Model, Timestamps {
    type: ResourceType
    source: ConnectionApi
    source_id: number
    source_payload: Record<string, any>
    config: T
    target: ConnectionApi
    target_id: number
    target_payload: Record<string, any>
}

export interface ResourceBelongs {
    resource_id: number
}

export interface ResourceFilter extends Partial<Model>, Filter {
    source?: string
    source_id?: number | number[]
    target?: string
    target_id?: number
    type?: ResourceType
    with_stock_on_agis?: boolean
}

export interface ProductResourceConfig extends Dimensions {
    category_default_id: number
    name: string
    short_description: string
    description: string
    markup: number
    price: number
    balance: number
    reference: string
    gtin: number
    ncm: string
    active: boolean
    update: ProductUpdate
    images: ProductImage[]
    feature_ids?: number[]
}

export interface ProductImage {
    id: UUID
    source_id: number
    target_id: number
    src: string
    position: number
}

export enum ResourceType {
    PRODUCT = 'product'
}

export enum ProductUpdate {
    PARTIAL = 'partial',
    FULL = 'full',
    DISABLED = 'disabled'
}

export enum ResourceTypeEnum {
    SERVICE = 'ResourceService',
    REPOSITORY = 'ResourceRepository'
}
