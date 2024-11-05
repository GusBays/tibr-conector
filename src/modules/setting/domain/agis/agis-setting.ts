import { AttributeValueBelongs } from '../../../bagy/domain/attribute-value'
import { Setting, SettingConnection } from '../setting'

export interface AgisSetting extends Setting {
    connection: SettingConnection.AGIS
    config: AgisConfig
}

export interface AgisConfig {
    markup: number
    token: string
    min_price: number
    category_default_id: number
    weight_default: number
    pricing: AgisPricingSetting
}

export interface AgisPricingSetting {
    name: string
    groups: AgisPricingSettingGroup[]
}

export interface AgisPricingSettingGroup extends AttributeValueBelongs {
    name: string
    markup: number
}
