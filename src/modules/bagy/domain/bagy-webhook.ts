import { Model, Timestamps } from '../../../common/contracts/contracts'

export interface BagyWebhook extends Model, Timestamps {
    resource: BagyWebhookResource
    url: string
}

export type BagyWebhookEvent = `${BagyWebhookSubject}.${BagyWebhookAction}`

export enum BagyWebhookResource {
    ORDERS = 'orders',
    VARIATIONS = 'variations'
}

export enum BagyWebhookAction {
    CREATED = 'created',
    UPDATED = 'updated',
    CANCELLED = 'cancelled'
}

export enum BagyWebhookSubject {
    ORDER = 'order',
    VARIANT = 'variant',
    VARIANT_STOCK = 'variant_stock'
}

export interface BagyWebhookPayload {
    id: number
    event: BagyWebhookEvent
    data: Record<string, any>
}
