import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, throwIf } from '../../../common/helpers/helper'
import { Resource, ResourceFilter, ResourceTypeEnum } from './resource'
import { ResourceRepository } from './resource-repository'

@injectable()
export class ResourceService {
    constructor(@inject(ResourceTypeEnum.REPOSITORY) private readonly repository: ResourceRepository) {}

    static getInstance(): ResourceService {
        return container.resolve(ResourceTypeEnum.SERVICE)
    }

    async create(data: Resource): Promise<Resource> {
        return await this.repository.create(data)
    }

    async getPaginate(filter: ResourceFilter): Promise<Meta<Resource>> {
        return await this.repository.getPaginate(filter)
    }

    async getOne(filter: ResourceFilter): Promise<Resource> {
        const resource = await this.repository.getOne(filter)
        throwIf(isEmpty(resource), NotFound, ['resource'])
        return resource
    }

    async update(data: Resource): Promise<Resource> {
        return await this.repository.update(data)
    }

    async getAll(filter: ResourceFilter): Promise<Resource[]> {
        return await this.repository.getAll(filter)
    }
}
