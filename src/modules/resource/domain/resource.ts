import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { SettingConnection } from '../../setting/domain/setting'

export interface Resource extends Model, Timestamps {
    type: ResourceType
    source: SettingConnection
    source_id: number
    source_payload: Record<string, any>
    target: SettingConnection
    target_id: number
    target_payload: Record<string, any>
}

export interface ResourceFilter extends Partial<Model>, Filter {
    source?: string
    source_id?: number
    target?: string
    target_id?: number
    type?: ResourceType
}

export enum ResourceType {
    PRODUCT = 'product'
}

export enum ResourceTypeEnum {
    SERVICE = 'ResourceService',
    REPOSITORY = 'ResourceRepository'
}
