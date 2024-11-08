import { AxiosError } from 'axios'
import { UnprocessableEntity } from '../../../common/exceptions/unprocessable-entity'
import { isEmpty, isNotEmpty, isUndefined } from '../../../common/helpers/helper'
import { toFloat } from '../../agis/domain/agis-helper'
import { AgisPaginationParams } from '../../agis/domain/agis-pagination'
import {
    AgisProduct,
    AgisProductCustomAttribute,
    AgisProductCustomAttributeCode,
    AgisProductStock
} from '../../agis/domain/agis-product'
import { AgisRequest } from '../../agis/infra/http/axios/agis-request'
import { Dimensions, ProductConfig, ProductResource } from '../../resource/domain/product/product-resource'
import { Resource, ResourceType } from '../../resource/domain/resource'
import { AgisFetcher } from '../../setting/domain/connection/agis/agis-connection'
import { ConnectionApi, ImporterConnection } from '../../setting/domain/connection/connection'
import { Fetcher } from './fetcher'

type GetParams = (page: number, size: number) => AgisPaginationParams
export class AgisProductFetcher extends Fetcher<AgisFetcher> {
    protected async fetchDataBy(targets: ImporterConnection[]): Promise<Resource[]> {
        const { token } = this.fetcher.config

        if (isEmpty(token)) return

        const request = new AgisRequest(token)
        const pagination: GetParams = (page: number, size: number) => ({
            'searchCriteria[currentPage]': page,
            'searchCriteria[pageSize]': size
        })

        let total: number

        try {
            const res = await request.getProducts(pagination(1, 1))
            total = res.total_count
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                throw new UnprocessableEntity('agis', { token: 'unauthorized' })
            } else throw e
        }

        const perPage = 50
        const pages = Math.ceil(total / perPage)

        const resources: Resource[] = []

        for (let i = 1; i <= pages; i++) {
            const { items } = await request.getProducts(pagination(i, perPage))

            const byMinPrice = (item: AgisProduct) => {
                const price = this.getPriceOf(item)
                return price >= this.fetcher.config.min_price
            }
            const allowed = items.filter(byMinPrice)

            const toResource = async (target: ImporterConnection) => await this.toResource(target, allowed)
            const fetched = await Promise.all(targets.map(toResource))

            resources.push(...fetched.flat())
        }

        return resources
    }

    private async toResource(target: ImporterConnection, items: AgisProduct[]): Promise<ProductResource[]> {
        const toFormat = async (item: AgisProduct): Promise<ProductResource> => {
            const resource = await this.getResourceBy<ProductResource>(item.id, target.api, ResourceType.PRODUCT)

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
        return await Promise.all(items.map(toFormat))
    }

    private getConfigBy(item: AgisProduct, resource: ProductResource): ProductConfig {
        const getFromConfig = <T = any>(key: keyof ProductConfig, defaultValue: T = null) => {
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
                weight: toFloat(weight)
            }
        }

        const getBalance = (): { balance: number } => {
            const toSumBalance = (current: number, stock: AgisProductStock) => stock.qty + current
            const balance = getFromConfig('balance', item.stock.reduce(toSumBalance, 0))

            return { balance }
        }

        return {
            name: getFromConfig('name', item.name),
            category_default_id: getFromConfig('category_default_id', this.fetcher.config.category_default_id),
            description: getFromConfig('description', getCustomAttributeBy(AgisProductCustomAttributeCode.DESCRIPTION)),
            short_description: getFromConfig(
                'short_description',
                getCustomAttributeBy(AgisProductCustomAttributeCode.SHORT_DESCRIPTION)
            ),
            markup: getFromConfig('markup', undefined),
            ...getPrice(),
            ...getDimensions(),
            ...getBalance(),
            reference: getFromConfig('reference', item.sku),
            gtin: getFromConfig('gtin', +getCustomAttributeBy(AgisProductCustomAttributeCode.GTIN)),
            ncm: getFromConfig('ncm', getCustomAttributeBy(AgisProductCustomAttributeCode.FISCAL_CLASSIFICATION)),
            active: getFromConfig('active', true),
            partial_update: getFromConfig('partial_update', false),
            allowed_to_import: getFromConfig('allowed_to_import', true)
        }
    }

    private getPriceOf(item: AgisProduct): number {
        const toSumPrice = (current: number, stock: AgisProductStock) => stock.price + current
        return item.stock.reduce(toSumPrice, 0)
    }
}
