import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'

export interface Setting extends Model, Timestamps {
    agis: AgisSetting
    bagy: BagySetting
    pricing: PriceSetting
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

export interface PriceSetting {
    name: string
    groups: PriceSettingGroup[]
}

export interface PriceSettingGroup {
    name: string
    markup: string
}

export interface SettingFilter extends Partial<Model>, Filter {}

export enum SettingTypeEnum {
    SERVICE = 'SettingService',
    REPOSITORY = 'SettingRepository'
}
