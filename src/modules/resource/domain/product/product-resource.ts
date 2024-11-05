import { Resource, ResourceType } from '../resource'

export interface ProductResource extends Resource {
    type: ResourceType.PRODUCT
    config: ProductConfig
}

export interface ProductConfig {
    name: string
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
}
