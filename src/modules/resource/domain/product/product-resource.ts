import { Resource, ResourceType } from '../resource'

export interface ProductResource extends Resource {
    type: ResourceType.PRODUCT
    config: ProductConfig
}

export interface ProductConfig extends Dimensions {
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
    partial_update: boolean
    allowed_to_import: boolean
    images: string[]
    category_ids?: number[]
    feature_ids?: number[]
}

export interface Dimensions {
    width: number
    height: number
    depth: number
    weight: number
}
