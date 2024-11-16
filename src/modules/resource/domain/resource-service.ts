import { UUID } from 'crypto'
import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { NotFound } from '../../../common/exceptions/not-found'
import { UnprocessableEntity } from '../../../common/exceptions/unprocessable-entity'
import { FileSystem } from '../../../common/file-system/domain/file-system'
import { isEmpty, isNotEmpty, throwIf } from '../../../common/helpers/helper'
import { ImporterFactory } from '../../importer/domain/importer-factory'
import { Connection, ImporterConnection } from '../../setting/domain/connection/connection'
import { isImporter } from '../../setting/domain/connection/connection-helper'
import { SettingService } from '../../setting/domain/setting-service'
import { Resource, ResourceFilter, ResourceType, ResourceTypeEnum } from './resource'
import { isProductResource } from './resource-helper'
import { ResourceRepository } from './resource-repository'

@injectable()
export class ResourceService {
    constructor(@inject(ResourceTypeEnum.REPOSITORY) private readonly repository: ResourceRepository) {}

    static getInstance(): ResourceService {
        return container.resolve(ResourceTypeEnum.SERVICE)
    }

    async create(data: Resource): Promise<Resource> {
        const resource = await this.repository.create(data)

        if (false === isProductResource(resource)) return resource

        const { images } = resource.config

        if (isEmpty(images)) return resource

        const toSave = async (src: string) => await FileSystem.save(src, `resources/${resource.type}/images/${resource.id}`)
        resource.config.images = await Promise.all(images.map(toSave))

        return await this.update(resource)
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
        if (isProductResource(data) && isNotEmpty(data.config.images)) {
            const toSave = async (src: string) =>
                await FileSystem.save(src, `resources/${ResourceType.PRODUCT}/images/${data.id}`)
            data.config.images = await Promise.all(data.config.images.map(toSave))
        }

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

    async createImage(filter: ResourceFilter, image: string): Promise<{ src: string }> {
        const resource = await this.getOne(filter)

        if (false === isProductResource(resource)) throw new UnprocessableEntity('resource', { image: 'not_allowed' })

        const media = await FileSystem.save(image, `resources/${resource.type}/images/${resource.id}`)

        const images = resource.config?.images

        if (isNotEmpty(images)) images.push(media)
        else resource.config.images = [media]

        await this.update(resource)

        const src = media.replace('media://', process.env.APP_URL)

        return { src }
    }

    async getImage(filter: ResourceFilter & { image_id: `${UUID}.${string}` }): Promise<Buffer> {
        try {
            return await FileSystem.get(`resources/${filter.type}/images/${filter.id}/${filter.image_id}`)
        } catch (e) {
            if (e.message?.includes('ENOENT')) throw new NotFound('image')
            else throw e
        }
    }

    async deleteImage(filter: ResourceFilter & { image_id: `${UUID}.${string}` }): Promise<void> {
        const resource = await this.getOne(filter)

        if (false === isProductResource(resource)) throw new UnprocessableEntity('resource', { image: 'not_allowed' })

        const { images } = resource.config

        const path = `resources/${resource.type}/images/${resource.id}/${filter.image_id}`
        const media = `media://${path}`

        const index = images.indexOf(media)

        if (index === -1) throw new NotFound('image')

        images.splice(index, 1)

        await FileSystem.delete(path)
        await this.update(resource)
    }
}
