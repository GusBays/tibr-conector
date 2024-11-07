import { Model, Timestamps } from '../../../common/contracts/contracts'

export interface AgisProduct extends Model, Timestamps {
    sku: string
    stock: AgisProductStock[]
    name: string
    attribute_set_id: number
    price: number
    status: 1
    visibility: 4
    type_id: AgisProductType
    product_links: []
    options: []
    extension_attributes: {
        website_ids: number[]
        category_links: AgisProductCategory[]
    }
    media_gallery_entries: AgisProductMediaGallery[]
    tier_prices: []
    custom_attributes: AgisProductCustomAttribute[]
}

export interface AgisProductStock {
    warehouse: AgisProductStockWarehouse
    qty: number
    price: number
}

export enum AgisProductStockWarehouse {
    /** @info Produtos físicos */
    CAMPINAS = '001',
    /** @info Produtos físicos */
    SERRA_ES_1 = '007',
    /** @info Produtos digitais */
    SERRA_ES_2 = '010'
}

export enum AgisProductType {
    /** @info Produto simples */
    SIMPLE = 'simple',
    /** @info Produto kit */
    BUNDLE = 'bundle'
}

export interface AgisProductCategory {
    category_id: string
    position: string
    category_name: string
}

export type AgisProductImageMediaGalleryType = 'image' | 'small_image' | 'thumbnail' | 'swatch_image'
export interface AgisProductMediaGallery {
    id: number
    media_type: 'image'
    label: string
    position: number
    disabled: boolean
    types: AgisProductImageMediaGalleryType[]
    file: string
}

export enum AgisProductCustomAttributeCode {
    RECURRENCY = 'is_recurrence',
    GIFT_MESSAGE = 'gift_message_available',
    GIFT_WRAPPING = 'gift_wrapping_available',
    SLUG = 'url_key',
    IMAGE = 'image',
    SMALL_IMAGE = 'small_image',
    SWATCH_IMAGE = 'swatch_image',
    THUMBNAIL = 'thumbnail',
    IMAGE_LABEL = 'image_label',
    SMALL_IMAGE_LABEL = 'small_image_label',
    THUMBNAIL_LABEL = 'thumbnail_label',
    SHORT_DESCRIPTION = 'short_description',
    DESCRIPTION = 'description',
    TYPE = 'tipo',
    COLOR = 'cor',
    BRAND = 'branch',
    OPTIONS_CONTAINER = 'options_container',
    GTIN = 'ean',
    META_KEYWORD = 'meta_keyword',
    HEIGHT = 'altura',
    HEIGHT_WITHOUT_PACKAGE = 'altura_sem_embalagem',
    DEPTH = 'comprimento',
    DEPTH_WITHOUT_PACKAGE = 'comprimento_sem_embalagem',
    WIDTH = 'largura',
    WIDTH_WITHOUT_PACKAGE = 'largura_sem_embalagem',
    GROSS_WEIGHT = 'peso_bruto',
    GROSS_WEIGHT_WITHOUT_PACKAGE = 'peso_bruto_sem_embalagem',
    LIQUID_WEIGHT = 'peso_liquido',
    LIQUID_WEIGHT_WITHOUT_PACKAGE = 'peso_liquido_sem_embalagem',
    TAX_ID = 'tax_class_id',
    WARRANTY = 'garantia_fabricante',
    REQUIRED_OPTIONS = 'required_options',
    SPECIAL_CAR = 'carro_especial',
    HAS_OPTIONS = 'has_options',
    FISCAL_CLASSIFICATION = 'classificacao_fiscal',
    ORIGIN = 'origem',
    RETURNABLE = 'is_returnable',
    MADE_TO_ORDER = 'sob_encomenda',
    PRICE_DISPLAY = 'msrp_display_actual_price_type'
}
export interface AgisProductCustomAttribute {
    attribute_code: AgisProductCustomAttributeCode
    value: string
    value_label: string
}
