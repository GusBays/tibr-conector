import { Model } from '../../../common/contracts/contracts'
import { ResourceType } from '../../resource/domain/resource'

export enum FetcherTypeEnum {
    SERVICE = 'FetcherService'
}

export interface FetcherFilter extends Model {
    resource: ResourceType
}
