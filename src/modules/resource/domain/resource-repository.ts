import { Repository } from '../../../common/contracts/contracts'
import { Resource, ResourceFilter } from './resource'

export interface ResourceRepository extends Partial<Repository<ResourceFilter, Resource>> {
    insert(data: Resource[]): Promise<Resource[]>
}
