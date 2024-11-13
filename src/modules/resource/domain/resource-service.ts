import { UUID } from 'crypto'
import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { NotFound } from '../../../common/exceptions/not-found'
import { FileSystem } from '../../../common/file-system/domain/file-system'
import { isEmpty, throwIf } from '../../../common/helpers/helper'
import { ImporterFactory } from '../../importer/domain/importer-factory'
import { Connection, ImporterConnection } from '../../setting/domain/connection/connection'
import { isImporter } from '../../setting/domain/connection/connection-helper'
import { SettingService } from '../../setting/domain/setting-service'
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

    async sync(filter: ResourceFilter): Promise<Resource> {
        const resource = await this.getOne(filter)
        const setting = await SettingService.getInstance().getOne({})
        const byApi = (connection: Connection) =>
            connection.active && connection.api === resource.target && isImporter(connection)
        const importer = setting.connections.find(byApi) as ImporterConnection

        throwIf(isEmpty(importer), NotFound, ['importer'])

        await ImporterFactory.getInstance(resource.type, setting, importer).importOne(resource)

        return await this.update(resource)
    }

    async getImage(filter: ResourceFilter & { image_id: UUID }): Promise<Buffer> {
        return FileSystem.get(`resources/${filter.type}/images/${filter.id}/${filter.image_id}.jpg`)
    }
}
