import { Model, Timestamps } from '../../../common/contracts/contracts'

export interface BagyAttribute extends Model, Timestamps {
    name: string
    values: BagyAttributeValue[]
}

export interface AttributeBelongs {
    attribute_id: number
}

export interface BagyAttributeValue extends Model, AttributeBelongs, Timestamps {
    name: string
    position: number
}

export interface AttributeValueBelongs {
    attribute_value_id: number
}

export interface AttributeValueSecondaryBelongs {
    attribute_value_secondary_id: number
}
