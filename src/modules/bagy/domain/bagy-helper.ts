import { BagyOrderWebhook } from './bagy-order'
import { BagyVariationWebhook } from './bagy-variation'
import { BagyWebhookPayload, BagyWebhookSubject } from './bagy-webhook'

export function isBagyOrderWebhook(data: BagyWebhookPayload): data is BagyOrderWebhook {
    const subject = data.event.split('.')[0]
    return BagyWebhookSubject.ORDER === subject
}

export function isBagyVariationWebhook(data: BagyWebhookPayload): data is BagyVariationWebhook {
    const subject = data.event.split('.')[0]
    return BagyWebhookSubject.VARIANT === subject
}

export function isBagyVariationStockWebhook(data: BagyWebhookPayload): data is BagyVariationWebhook {
    const subject = data.event.split('.')[0]
    return BagyWebhookSubject.VARIANT_STOCK === subject
}
