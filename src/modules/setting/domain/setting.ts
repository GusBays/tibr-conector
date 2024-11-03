import { Model, Timestamps } from '../../../common/contracts/contracts'

export interface Setting extends Model, Timestamps {
    agis: AgisSetting
    bagy: BagySetting
    pricing: Pricing
}

export interface AgisSetting {
    markup: number
    token: string
    active: boolean
    min_price: number
    category_default_id: number
    weight_default: number
}

export interface BagySetting {
    token: string
    active: boolean
}

export interface Pricing {
    name: string
    groups: PriceGroup[]
}

export interface PriceGroup {
    name: string
    markup: string
}
