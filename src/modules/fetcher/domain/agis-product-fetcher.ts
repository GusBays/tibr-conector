import { randomUUID } from 'crypto'
import { Dimensions } from '../../../common/contracts/contracts'
import { isEmpty, isNotEmpty, isUndefined } from '../../../common/helpers/helper'
import { toFloat } from '../../agis/domain/agis-helper'
import {
    AgisProduct,
    AgisProductCustomAttribute,
    AgisProductCustomAttributeCode,
    AgisProductMediaGallery,
    AgisProductStock
} from '../../agis/domain/agis-product'
import { AgisRequest } from '../../agis/infra/http/axios/agis-request'
import { ProductImage, ProductResourceConfig, Resource, ResourceType } from '../../resource/domain/resource'
import { AgisFetcher } from '../../setting/domain/connection/agis/agis-connection'
import { ConnectionApi, ImporterConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'
import { Fetcher } from './fetcher'

export class AgisProductFetcher extends Fetcher<AgisFetcher> {
    private readonly request: AgisRequest

    constructor(setting: Setting, fetcher: AgisFetcher) {
        super(setting, fetcher)
        this.request = new AgisRequest(fetcher.config.token)
    }

    protected async fetchDataBy(
        targets: ImporterConnection[],
        page: number = 1
    ): Promise<{ resources: Resource[]; hasNextPage: boolean }> {
        const perPage = 50

        const { items, total_count } = await this.request.getProducts({
            'searchCriteria[currentPage]': page,
            'searchCriteria[pageSize]': perPage
        })

        const pages = Math.ceil(total_count / perPage)

        const byMinPrice = (item: AgisProduct) => {
            const price = this.getPriceOf(item)
            return price >= this.fetcher.config.min_price
        }
        const filtered = items.filter(byMinPrice)

        const toResource = async (target: ImporterConnection) => {
            const rows = await this.resourceService.getAll({
                source: this.fetcher.api,
                source_id: filtered.map(({ id }) => id),
                target: target.api,
                type: ResourceType.PRODUCT
            })

            const toFormat = (item: AgisProduct) => {
                const resource = rows.find(({ source_id }) => source_id === item.id)
                return {
                    id: resource?.id,
                    source: ConnectionApi.AGIS,
                    source_id: item.id,
                    source_payload: item,
                    type: ResourceType.PRODUCT,
                    target: target.api,
                    target_id: resource?.target_id,
                    target_payload: resource?.target_payload,
                    config: this.getConfigBy(item, resource),
                    created_at: undefined,
                    updated_at: undefined
                }
            }
            return items.map(toFormat)
        }
        const resources = await Promise.all(targets.map(toResource))

        return {
            resources: resources.flat(),
            hasNextPage: page < pages
        }
    }

    private getConfigBy(item: AgisProduct, resource: Resource<ProductResourceConfig>): ProductResourceConfig {
        const getFromConfig = <T = any>(key: keyof ProductResourceConfig, defaultValue: T = null) => {
            if (isEmpty(resource?.config)) return defaultValue

            const { config } = resource
            const value = config[key]

            return isUndefined(value) ? defaultValue : (value as T)
        }

        const getCustomAttributeBy = (code: AgisProductCustomAttributeCode) => {
            const byCode = (attribute: AgisProductCustomAttribute) => attribute.attribute_code === code
            const customAttribute = item.custom_attributes.find(byCode)
            return isNotEmpty(customAttribute) && isNotEmpty(customAttribute.value) ? customAttribute.value : null
        }

        const getPrice = (): { price: number } => {
            const price = getFromConfig('price')

            if (isNotEmpty(price)) return { price }

            return { price: this.getPriceOf(item) }
        }

        const getDimensions = (): Dimensions => {
            const [weight, height, width, depth] = [
                getFromConfig('weight', getCustomAttributeBy(AgisProductCustomAttributeCode.GROSS_WEIGHT)),
                getFromConfig('height', getCustomAttributeBy(AgisProductCustomAttributeCode.HEIGHT)),
                getFromConfig('width', getCustomAttributeBy(AgisProductCustomAttributeCode.WIDTH)),
                getFromConfig('depth', getCustomAttributeBy(AgisProductCustomAttributeCode.DEPTH))
            ]

            return {
                width: toFloat(width),
                height: toFloat(height),
                depth: toFloat(depth),
                weight: toFloat(weight ?? this.fetcher.config.weight_default)
            }
        }

        const getBalance = (): { balance: number } => {
            const toSumBalance = (current: number, stock: AgisProductStock) => stock.qty + current
            const balance = getFromConfig('balance', item.stock.reduce(toSumBalance, 0))

            return { balance }
        }

        const getImages = (): { images: ProductImage[] } => {
            const images = getFromConfig<ProductImage[]>('images', [])

            const imagesFromAgis = item.media_gallery_entries

            const byNotInConfig = (agisImage: AgisProductMediaGallery) => {
                const byId = (productImage: ProductImage) => agisImage.id === productImage.source_id
                return isEmpty(images.find(byId))
            }
            const newImages = imagesFromAgis.filter(byNotInConfig)

            if (isEmpty(newImages)) return { images }

            const toProductImage = (agisImage: AgisProductMediaGallery): ProductImage => ({
                id: randomUUID(),
                source_id: agisImage.id,
                target_id: null,
                src: `${process.env.AGIS_API_URL}/media/catalog/product${agisImage.file}`,
                position: agisImage.position
            })

            return { images: [...images, ...newImages.map(toProductImage)] }
        }

        return {
            name: getFromConfig('name', item.name),
            category_default_id: getFromConfig('category_default_id'),
            description: getFromConfig('description', getCustomAttributeBy(AgisProductCustomAttributeCode.DESCRIPTION)),
            short_description: getFromConfig(
                'short_description',
                getCustomAttributeBy(AgisProductCustomAttributeCode.SHORT_DESCRIPTION)
            ),
            markup: getFromConfig('markup', undefined),
            ...getPrice(),
            ...getDimensions(),
            ...getBalance(),
            ...getImages(),
            reference: getFromConfig('reference', item.sku),
            gtin: getFromConfig('gtin', +getCustomAttributeBy(AgisProductCustomAttributeCode.GTIN)),
            ncm: getFromConfig('ncm', getCustomAttributeBy(AgisProductCustomAttributeCode.FISCAL_CLASSIFICATION)),
            active: getFromConfig('active', true),
            partial_update: getFromConfig('partial_update', false),
            allowed_to_import: getFromConfig('allowed_to_import', false)
        }
    }

    private getPriceOf(item: AgisProduct): number {
        const toSumPrice = (current: number, stock: AgisProductStock) => stock.price + current
        return +item.stock.reduce(toSumPrice, 0).toFixed(2)
    }
}
