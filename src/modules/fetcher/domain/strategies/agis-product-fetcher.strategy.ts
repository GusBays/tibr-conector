import { randomUUID } from 'crypto'
import { Dimensions } from '../../../../common/contracts/contracts'
import { isEmpty, isNotEmpty, isUndefined } from '../../../../common/helpers/helper'
import { sanitizeAndFixHtml } from '../../../../common/helpers/html'
import { toFloat } from '../../../agis/domain/agis-helper'
import {
    AgisProduct,
    AgisProductCustomAttribute,
    AgisProductCustomAttributeCode,
    AgisProductMediaGallery
} from '../../../agis/domain/agis-product'
import { AgisRequest } from '../../../agis/infra/http/axios/agis-request'
import {
    ProductImage,
    ProductResourceConfig,
    ProductUpdate,
    Resource,
    ResourceType
} from '../../../resource/domain/resource'
import { AgisFetcher } from '../../../setting/domain/connection/agis/agis-connection'
import { ConnectionApi, ImporterConnection } from '../../../setting/domain/connection/connection'
import { Setting } from '../../../setting/domain/setting'
import { FetcherStrategy } from './fetcher.strategy'

export class AgisProductFetcherStrategy extends FetcherStrategy<AgisFetcher> {
    private readonly request: AgisRequest

    constructor(setting: Setting, fetcher: AgisFetcher) {
        super(setting, fetcher)
        this.request = new AgisRequest(fetcher.config.token)
    }

    async fetchOne(resource: Resource<ProductResourceConfig>): Promise<Resource> {
        const { sku } = resource.source_payload as AgisProduct

        const source_payload = await this.request.getProduct(sku)

        resource.source_payload = source_payload
        resource.config = this.getConfigBy(source_payload, resource)

        return resource
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

        const byConfig = (item: AgisProduct) => {
            const { price, balance } = this.getBalanceAndPriceOf(item)
            return price >= this.fetcher.config.min_price && balance >= this.fetcher.config.min_stock
        }
        const filtered = items.filter(byConfig)

        const toResource = async (target: ImporterConnection) => {
            const rows = await this.resourceService.getAll({
                source: this.fetcher.api,
                source_id: filtered.map(({ id }) => id),
                target: target.api,
                type: ResourceType.PRODUCT,
                ignore_deleted: false
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
            return filtered.map(toFormat)
        }
        const resources = isNotEmpty(filtered) ? await Promise.all(targets.map(toResource)) : []

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

        const getPriceAndBalance = (): { price: number; balance: number } => {
            const { balance, price } = this.getBalanceAndPriceOf(item)
            return { price: getFromConfig('price', price), balance }
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

        const description = getFromConfig('description', getCustomAttributeBy(AgisProductCustomAttributeCode.DESCRIPTION))
        const shortDescription = getFromConfig(
            'short_description',
            getCustomAttributeBy(AgisProductCustomAttributeCode.SHORT_DESCRIPTION)
        )

        return {
            name: getFromConfig('name', item.name),
            category_default_id: getFromConfig('category_default_id'),
            description: isNotEmpty(description) ? sanitizeAndFixHtml(description) : description,
            short_description: isNotEmpty(shortDescription) ? sanitizeAndFixHtml(shortDescription) : shortDescription,
            markup: getFromConfig('markup', undefined),
            ...getPriceAndBalance(),
            ...getDimensions(),
            ...getImages(),
            sku: getFromConfig('sku', item.sku),
            gtin: getFromConfig('gtin', +getCustomAttributeBy(AgisProductCustomAttributeCode.GTIN)),
            ncm: getFromConfig('ncm', getCustomAttributeBy(AgisProductCustomAttributeCode.FISCAL_CLASSIFICATION)),
            active: getFromConfig('active', this.fetcher.config.import_as_active),
            update: getFromConfig('update', ProductUpdate.DISABLED)
        }
    }

    private getBalanceAndPriceOf(item: AgisProduct): { price: number; balance: number } {
        let price = 0
        let balance = 0

        item.stock.forEach(stock => {
            price += stock.price
            balance += stock.qty
        })

        return {
            price: +price.toFixed(2),
            balance
        }
    }
}
