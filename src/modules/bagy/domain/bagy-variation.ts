import { Model, Timestamps } from '../../../common/contracts/contracts'
import { AttributeValueBelongs, AttributeValueSecondaryBelongs } from './bagy-attribute'
import { BagyPrice } from './bagy-price'
import { ProductBelongs } from './bagy-product'
import { BagyWebhookAction, BagyWebhookPayload, BagyWebhookSubject } from './bagy-webhook'
import { ColorBelongs } from './color'

export interface BagyVariationWebhook extends BagyWebhookPayload {
    event: `${BagyWebhookSubject.VARIANT}.${BagyWebhookAction}`
    data: BagyVariation
}

export interface BagyVariationStockWebhook extends BagyWebhookPayload {
    event: `${BagyWebhookSubject.VARIANT_STOCK}.${BagyWebhookAction}`
    data: BagyVariation
}

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
