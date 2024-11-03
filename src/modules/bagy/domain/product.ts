import { Model, Timestamps } from '../../../common/contracts/contracts'
import { CategoryDefaultBelongs } from './category'
import { BagyDimensions } from './dimentions'
import { BagyPrice } from './price'
import { BagyVariation } from './variation'

export interface BagyProduct extends Model, CategoryDefaultBelongs, BagyDimensions, BagyPrice, Timestamps {
    name: string
    slug: string
    external_id: string
    short_description: string
    description: string
    ncm: string
    active: boolean
    variations: BagyVariation[]
}
