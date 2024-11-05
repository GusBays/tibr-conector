import { Resource, ResourceType } from '../resource'

export interface ProductResource extends Resource {
    type: ResourceType.PRODUCT
    config: ProductConfig
}

export interface ProductConfig {
    category_default_id: number
    name: string
    short_description: string
    description: string
    markup: number
    price: number
    weight: number
    height: number
    width: number
    depth: number
    balance: number
    reference: string
    gtin: number
    ncm: string
    active: boolean
    partial_update: boolean
    allowed_to_update: boolean
    category_ids?: number[]
    feature_ids?: number[]
}
