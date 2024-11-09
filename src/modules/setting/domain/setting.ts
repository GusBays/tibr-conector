import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { AttributeBelongs, AttributeValueBelongs } from '../../bagy/domain/bagy-attribute'
import { Connection } from './connection/connection'

export interface Setting extends Model, Timestamps {
    connections: Connection[]
    pricing: SettingPricing
}

export interface SettingBelongs {
    setting_id: number
}

export interface SettingPricing extends AttributeBelongs {
    name: string
    groups: PricingSettingGroup[]
}

export interface PricingSettingGroup extends AttributeValueBelongs {
    name: string
    markup: number
    position: number
}

export interface SettingFilter extends Partial<Model>, Filter {}

export enum SettingTypeEnum {
    SERVICE = 'SettingService',
    REPOSITORY = 'SettingRepository'
}
