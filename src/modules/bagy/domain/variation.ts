import { Model, Timestamps } from '../../../common/contracts/contracts'
import { AttributeValueBelongs, AttributeValueSecondaryBelongs } from './attribute-value'
import { ColorBelongs } from './color'
import { BagyPrice } from './price'
import { ProductBelongs } from './product'

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
