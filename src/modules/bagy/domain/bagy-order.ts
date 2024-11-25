import { BagyWebhookAction, BagyWebhookPayload, BagyWebhookSubject } from './bagy-webhook'

export interface BagyOrderWebhook extends BagyWebhookPayload {
    event: `${BagyWebhookSubject.ORDER}.${BagyWebhookAction}`
    data: BagyOrder
}

export interface BagyOrder {
    address: BagyOrderAddress
    code: number
    cost: string
    created_at: string
    customer_id: number
    customer: Record<string, any>
    device: string
    discount: string
    discounts: BagyOrderDiscount[]
    extra: BagyOrderExtra
    status: BagyOrderStatus
    payment_status: BagyOrderPaymentStatus
    fulfillment_status: BagyOrderFulfillmentStatus
    has_shipping: boolean
    histories: BagyOrderHistory[]
    id: number
    is_subscription: boolean
    items: BagyOrderItem[]
    marketplace: BagyOrderMarketplace
    payment: BagyOrderPayment
    schedule_delivery: ScheduleDelivery
    quantity: number
    shipping: BagyOrderShipping
    subscription?: any
    subtotal: string
    tax: string
    taxes: string[]
    token: string
    total: string
    type: string
    updated_at: string
    user?: Record<string, any>
    archived_at?: string
    canceled_at?: string
    external_id?: number
    fulfillment?: IOrderFulfillment
    note?: string
    tags?: string
}

interface BagyOrderDiscount {
    amount: string
    code: string
    created_at: string
    discount_id: number
    id: number
    is_free_freight: number
    name: string
    order_id: number
    type: string
    updated_at: string
    value: string
    value_type: string
}

export interface IOrderFulfillment {
    created_at: string
    id: number
    nfe_created_at: string
    nfe_number: string
    nfe_series: string
    nfe_token: string
    nfe_xml: string
    order_id: number
    shipping_carrier: string
    shipping_carrier_api: string
    shipping_carrier_id: number
    shipping_code: string
    shipping_created_at: string
    shipping_track_description: string
    shipping_track_url: string
    status: string
    order_subtotal: string
    updated_at: string
}

export interface BagyOrderAddress {
    id: number
    order_id: number
    receiver: string
    name: string
    zipcode: string
    street: string
    number: string
    detail: string
    district: string
    city: string
    state: string
    city_ibge_id: string
}

export interface BagyOrderExtra {
    customer_ip: string
    user_agent: string
    schedule_delivery?: Record<string, any>
    utm?: Record<string, any>
}

export interface BagyOrderMarketplace {
    hub_name: string
    id: number
    marketplace_name: string
    order_hub_id: string
    order_id: number
    order_marketplace_id: string
}

export enum UserTypeEnum {
    frontend = 'frontend',
    admin = 'admin',
    api = 'api',
    bridge = 'bridge',
    app = 'app',
    erp = 'erp'
}

export interface BagyOrderHistory {
    created_at: string
    id: number
    order_id: number
    status: string
    user_id: number
    note?: string
    user_name?: string
    user_type?: UserTypeEnum
}

export interface BagyOrderItem {
    additional_price: string
    components: BagyOrderItem[]
    customize: any
    discount: string
    grid: any
    gtin: any
    id: number
    is_cover: number
    is_gift: boolean
    is_virtual: boolean
    kit: number
    name: string
    order_id: number
    price: string
    product_id: number
    quantity: number
    selling_out_of_stock: number
    total: string
    url: string
    variation_id: number
    billet_discount?: string
    checker?: any
    cost?: string
    depth?: string
    external_id?: number
    gift_wrapping?: GiftWrap | null
    height?: string
    image?: any
    mpn?: any
    ncm?: any
    note?: any
    options?: any
    parent_id?: number
    price_compare?: string
    reference?: any
    sku?: string
    stock_location?: any
    subscription_plan_id?: number
    variation?: string
    weight?: string
    width?: string
    created_at?: string
    updated_at?: string
}

export interface BagyOrderPayment {
    created_at: string
    discount: string
    id: number
    interest: string
    method: string
    name: string
    order_id: number
    parcel_price: string
    parcels: number
    payment_id: number
    status: string
    updated_at: string
    card_bin?: any
    card_brand?: string
    card_cgc?: string
    card_end?: string
    card_expiry_date?: string
    card_owner?: string
    description?: string
    digitable_line?: string
    expires_at?: string
    external?: any
    gateway_id?: number
    nsu?: any
    processed_at?: string
    processed_by?: string
    token?: string
    url?: string
}

export interface BagyOrderShipping {
    alias: string
    carrier_id: number
    created_at: string
    has_lower_price: number
    id: number
    name: string
    order_id: number
    price: string
    price_cost: string
    shipment_time: number
    updated_at: string
    additional_message?: string
    api?: any
    delivery_time?: number
    estimated_delivery_at?: string
    estimated_shipment_at?: string
}

export interface ScheduleDelivery {
    date: string
    period: string
    fields?: Record<string, string>
}

interface GiftWrap {
    enabled: boolean
    has_gift_wrapping: number
    price: string
}

export type BagyOrderPaymentStatus =
    | 'unpaid'
    | 'pending'
    | 'approved'
    | 'denied'
    | 'expired'
    | 'refunded'
    | 'chargeback'
    | 'canceled'

export type BagyOrderStatus = 'open' | 'archived' | 'canceled'

export type BagyOrderFulfillmentStatus = 'unfulfilled' | 'attended' | 'invoiced' | 'shipped' | 'delivered'
