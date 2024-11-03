import { Filter, Model, Timestamps } from "../../../common/contracts/contracts"

export interface Resource extends Model, Timestamps {
    type: ResourceType
    source: ResourceSource
    source_id: number
    source_payload: Record<string, any>
    target: ResourceTarget
    target_id: number
    target_payload: Record<string, any>
}

export interface ResourceFilter extends Partial<Model>, Filter {}

export enum ResourceType {
    PRODUCT = 'product'
}

export enum ResourceSource {
    AGIS = 'agis'
}

export enum ResourceTarget {
    BAGY = 'bagy'
}

export enum ResourceTypeEnum {
    SERVICE = 'ResourceService',
    REPOSITORY = 'ResourceRepository'
}