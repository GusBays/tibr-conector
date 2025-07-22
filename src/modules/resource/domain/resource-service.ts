import { randomUUID, UUID } from 'crypto'
import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { NotFound } from '../../../common/exceptions/not-found'
import { UnprocessableEntity } from '../../../common/exceptions/unprocessable-entity'
import { FileSystem } from '../../../common/file-system/domain/file-system'
import { isEmpty, isNotEmpty, not, throwIf } from '../../../common/helpers/helper'
import { isBagyVariationStockWebhook } from '../../bagy/domain/bagy-helper'
import { BagyVariation } from '../../bagy/domain/bagy-variation'
import { BagyWebhookPayload } from '../../bagy/domain/bagy-webhook'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { FetcherStrategyFactory } from '../../fetcher/domain/strategies/fetcher.strategy.factory'
import { ImporterStrategyFactory } from '../../importer/domain/strategies/importer.strategy.factory'
import { Connection, ConnectionApi, FetcherConnection, ImporterConnection } from '../../setting/domain/connection/connection'
import { isFetcher, isImporter } from '../../setting/domain/connection/connection-helper'
import { SettingService } from '../../setting/domain/setting-service'
import { ProductImage, ProductResourceConfig, Resource, ResourceFilter, ResourceType, ResourceTypeEnum } from './resource'
import { isProductResource } from './resource-helper'
import { ResourceRepository } from './resource-repository'

@injectable()
export class ResourceService {
    constructor(@inject(ResourceTypeEnum.REPOSITORY) private readonly repository: ResourceRepository) {}

    static getInstance(): ResourceService {
        return container.resolve(ResourceTypeEnum.SERVICE)
    }

    async create(data: Resource): Promise<Resource> {
        await this.createImagesIfNeeded(data)
        return await this.repository.create(data)
    }

    async getPaginate(filter: ResourceFilter): Promise<Meta<Resource>> {
        return await this.repository.getPaginate(filter)
    }

    async getOne(filter: ResourceFilter): Promise<Resource> {
        const resource = await this.repository.getOne(filter)
        throwIf(isEmpty(resource), NotFound, 'resource')
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

    async delete(filter: ResourceFilter): Promise<void> {
        await this.repository.delete(filter)
    }

    async fetch(filter: ResourceFilter): Promise<Resource> {
        const resource = await this.getOne(filter)
        const setting = await SettingService.getInstance().getOne({})

        const byApi = (connection: Connection) =>
            connection.active && connection.api === resource.source && isFetcher(connection)
        const fetcher = setting.connections.find(byApi) as FetcherConnection

        throwIf(isEmpty(fetcher), NotFound, 'fetcher')

        await FetcherStrategyFactory.getInstance(resource.type, setting, fetcher).fetchOne(resource)

        return await this.update(resource)
    }

    async sync(filter: ResourceFilter): Promise<Resource> {
        const resource = await this.getOne(filter)
        const setting = await SettingService.getInstance().getOne({})
        const byApi = (connection: Connection) =>
            connection.active && connection.api === resource.target && isImporter(connection)
        const importer = setting.connections.find(byApi) as ImporterConnection

        throwIf(isEmpty(importer), NotFound, 'importer')

        await ImporterStrategyFactory.getInstance(resource.type, setting, importer).importOne(resource)

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

    async deleteImage(filter: ResourceFilter & { image_id: UUID }): Promise<Resource> {
        const resource = await this.getOne(filter)

        if (false === isProductResource(resource)) throw new UnprocessableEntity('resource', { image: 'not_allowed' })

        const { images } = resource.config

        const byId = (image: ProductImage) => image.id === filter.image_id
        const image = images.find(byId)

        throwIf(isEmpty(image), NotFound, 'image')

        images.splice(images.indexOf(image), 1)

        const name = image.src.split('/').pop()

        await FileSystem.delete(`resources/${resource.type}/images/${name}`)

        if (image.target_id) {
            const setting = await SettingService.getInstance().getOne({})
            const byTarget = (connection: Connection) => connection.api === resource.target
            const importer = setting.connections.find(byTarget)

            await ImporterStrategyFactory.getInstance(resource.type, setting, importer as ImporterConnection).deleteImage(
                resource.target_id,
                image.target_id
            )
        }

        return await this.update(resource)
    }

    async webhook(api: ConnectionApi, payload: BagyWebhookPayload): Promise<void> {
        const setting = await SettingService.getInstance().getOne({})

        const byApi = (connection: Connection) => api === connection.api
        const bagy = setting.connections.find(byApi)

        if (isEmpty(bagy) || not(bagy.active) || isEmpty(bagy.config.token)) return

        if (false === isBagyVariationStockWebhook(payload)) return

        const resource = (await this.getOne({
            type: ResourceType.PRODUCT,
            target: ConnectionApi.BAGY,
            target_id: payload.data.product_id
        })) as Resource<ProductResourceConfig>

        const newBalance = payload.data.balance

        if (resource.config.balance === newBalance) return

        Object.assign(resource.config, { balance: newBalance })

        const request = new BagyRequest(bagy.config.token)

        const product = await request.getProduct(payload.data.product_id)

        const toRemoveUpdatedOne = (variation: BagyVariation) => variation.id !== payload.id
        const setNewBalance = (variation: BagyVariation) => Object.assign(variation, { balance: newBalance })
        product.variations.filter(toRemoveUpdatedOne).forEach(setNewBalance)

        const target_payload = await request.updateProduct(product)
        await this.update({ ...resource, target_payload })
    }

    async getAll(filter: ResourceFilter): Promise<Resource[]> {
        return await this.repository.getAll(filter)
    }

    /**
     * Create resource images on filesystem if needed
     */
    private async createImagesIfNeeded(resource: Resource): Promise<void> {
        if (false === isProductResource(resource) || isEmpty(resource.config.images)) return

        const toSave = async (image: ProductImage) => {
            const res = await FileSystem.save(image.src, `resources/${ResourceType.PRODUCT}/images/${image.id}`)
            image.src = res
            return image
        }
        resource.config.images = await Promise.all(resource.config.images.map(toSave))
    }
}
