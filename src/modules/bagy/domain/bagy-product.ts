import { Model, Timestamps } from '../../../common/contracts/contracts'
import { Dimensions } from '../../resource/domain/product/product-resource'
import { BagyPrice } from './bagy-price'
import { BagyVariation } from './bagy-variation'
import { CategoryDefaultBelongs } from './category'

export interface BagyProduct extends Model, CategoryDefaultBelongs, Dimensions, BagyPrice, Timestamps {
    name: string
    slug: string
    external_id: string
    short_description: string
    description: string
    ncm: string
    active: boolean
    variations: BagyVariation[]
    category_ids?: number[]
    feature_ids?: number[]
}

export interface ProductBelongs {
    product_id: number
}
