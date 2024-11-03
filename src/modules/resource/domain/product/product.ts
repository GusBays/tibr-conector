import { Resource, ResourceType } from "../resource";

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
    ncm: number
    partial_update: boolean
    complete_update: boolean
}