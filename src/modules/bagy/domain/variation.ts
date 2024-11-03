import { Model, Timestamps } from '../../../common/contracts/contracts'
import { AttributeValueBelongs, AttributeValueSecondaryBelongs } from './attribute-value'
import { ColorBelongs } from './color'
import { BagyPrice } from './price'

export interface BagyVariation
    extends Model,
        ColorBelongs,
        AttributeValueBelongs,
        AttributeValueSecondaryBelongs,
        BagyPrice,
        Timestamps {
    balance: number
    position: number
}
