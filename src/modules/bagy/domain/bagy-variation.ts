import { Model, Timestamps } from '../../../common/contracts/contracts'
import { AttributeValueBelongs, AttributeValueSecondaryBelongs } from './attribute-value'
import { BagyPrice } from './bagy-price'
import { ProductBelongs } from './bagy-product'
import { ColorBelongs } from './color'

export interface BagyVariation
    extends Model,
        ProductBelongs,
        ColorBelongs,
        AttributeValueBelongs,
        AttributeValueSecondaryBelongs,
        BagyPrice,
        Timestamps {
    balance: number
    position: number
}
