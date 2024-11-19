import { randomUUID, UUID } from 'crypto'
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
import { ProductImage } from './product/product-resource'
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
        if (isProductResource(data) && isNotEmpty(data.config.images)) {
            const toSave = async (image: ProductImage) => {
                const res = await FileSystem.save(image.src, `resources/${ResourceType.PRODUCT}/images/${image.id}`)
                image.src = res
                return image
            }
            data.config.images = await Promise.all(data.config.images.map(toSave))
        }

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
        if (isProductResource(data) && isNotEmpty(data.config.images)) {
            const toSave = async (image: ProductImage) => {
                const res = await FileSystem.save(image.src, `resources/${ResourceType.PRODUCT}/images/${image.id}`)
                image.src = res
                return image
            }
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

    async createImage(filter: ResourceFilter, image: string): Promise<ProductImage> {
        const resource = await this.getOne(filter)

        if (false === isProductResource(resource)) throw new UnprocessableEntity('resource', { image: 'not_allowed' })

        const lastPosition = resource.config?.images?.length || 0
        const productImage: ProductImage = {
            id: randomUUID(),
            src: image,
            source_id: null,
            target_id: null,
            position: lastPosition + 1
        }

        const { images } = resource.config

        if (isNotEmpty(images)) images.push(productImage)
        else resource.config.images = [productImage]

        await this.update(resource)

        return productImage
    }

    async getImage(filter: ResourceFilter & { image_id: `${UUID}.${string}` }): Promise<Buffer> {
        try {
            return await FileSystem.get(`resources/${filter.type}/images/${filter.image_id}`)
        } catch (e) {
            if (e.message?.includes('ENOENT')) throw new NotFound('image')
            else throw e
        }
    }

    async deleteImage(filter: ResourceFilter & { image_id: UUID }): Promise<void> {
        const resource = await this.getOne(filter)

        if (false === isProductResource(resource)) throw new UnprocessableEntity('resource', { image: 'not_allowed' })

        const { images } = resource.config

        const byId = (image: ProductImage) => image.id === filter.image_id
        const index = images.findIndex(byId)

        throwIf(-1 === index, NotFound, ['image'])

        images.splice(index, 1)

        await FileSystem.delete(`resources/${resource.type}/images/${filter.image_id}`)

        await this.update(resource)
    }
}
