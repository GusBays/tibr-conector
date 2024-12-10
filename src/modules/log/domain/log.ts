import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'
import { ResourceBelongs } from '../../resource/domain/resource'
import { ConnectionBelongs } from '../../setting/domain/connection/connection'

export interface Log extends Model, ConnectionBelongs, ResourceBelongs, Timestamps {
    payload: Record<string, any>
    message: Record<string, any>
}

export interface LogFilter extends Partial<Model>, Partial<ConnectionBelongs>, Partial<ResourceBelongs>, Filter {
    created_before: string
}

export enum LogTypeEnum {
    SERVICE = 'LogService',
    REPOSITORY = 'LogRepository'
}
