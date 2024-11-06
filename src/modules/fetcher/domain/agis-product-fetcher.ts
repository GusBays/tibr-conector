import { isEmpty, isNotEmpty, isUndefined } from '../../../common/helpers/helper'
import { AgisPaginationParams } from '../../agis/domain/pagination'
import {
    AgisProduct,
    AgisProductCustomAttribute,
    AgisProductCustomAttributeCode,
    AgisProductStock
} from '../../agis/domain/product'
import { AgisRequest } from '../../agis/infra/http/axios/agis-request'
import { ProductConfig, ProductResource } from '../../resource/domain/product/product-resource'
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

        const { total_count } = await request.getProducts(pagination(1, 1))

        const perPage = 50
        const pages = Math.ceil(total_count / perPage)

        const resources: Resource[] = []

        for (let i = 1; i <= pages; i++) {
            const { items } = await request.getProducts(pagination(i, perPage))

            const toResource = async (target: ImporterConnection) => await this.toResource(target, items)
            const result = await Promise.all(targets.map(toResource))

            resources.push(...result.flat())
        }

        return resources
    }

    private async toResource(target: ImporterConnection, items: AgisProduct[]): Promise<Resource[]> {
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
        const getFromConfig = (key: keyof ProductConfig, defaultValue: any = null) => {
            if (isEmpty(resource?.config)) return defaultValue

            const { config } = resource
            const value = config[key]

            return isUndefined(value) ? defaultValue : value
        }

        const getCustomAttributeBy = (code: AgisProductCustomAttributeCode, item: AgisProduct) => {
            const byCode = (attribute: AgisProductCustomAttribute) => attribute.attribute_code === code
            const customAttribute = item.custom_attributes.find(byCode)
            return isNotEmpty(customAttribute) && isNotEmpty(customAttribute.value) ? customAttribute.value : null
        }

        const toSumBalance = (current: number, stock: AgisProductStock) => stock.qty + current
        const getPrice = () => {
            const price = getFromConfig('price', item.price)

            if (isNotEmpty(price)) return price

            const markup = getFromConfig('markup', this.fetcher.config.markup)

            return item.price * markup
        }

        return {
            name: getFromConfig('name', item.name),
            category_default_id: getFromConfig('category_default_id', this.fetcher.config.category_default_id),
            description: getFromConfig(
                'description',
                getCustomAttributeBy(AgisProductCustomAttributeCode.DESCRIPTION, item)
            ),
            short_description: getFromConfig(
                'short_description',
                getCustomAttributeBy(AgisProductCustomAttributeCode.SHORT_DESCRIPTION, item)
            ),
            markup: getFromConfig('markup', this.fetcher.config.markup),
            price: getPrice(),
            weight: getFromConfig('weight', +getCustomAttributeBy(AgisProductCustomAttributeCode.GROSS_WEIGHT, item)),
            height: getFromConfig('height', +getCustomAttributeBy(AgisProductCustomAttributeCode.HEIGHT, item)),
            width: getFromConfig('width', +getCustomAttributeBy(AgisProductCustomAttributeCode.WIDTH, item)),
            depth: getFromConfig('depth', +getCustomAttributeBy(AgisProductCustomAttributeCode.DEPTH, item)),
            balance: getFromConfig('balance', item.stock.reduce(toSumBalance, 0)),
            reference: getFromConfig('reference', item.sku),
            gtin: getFromConfig('gtin', +getCustomAttributeBy(AgisProductCustomAttributeCode.GTIN, item)),
            ncm: getFromConfig('ncm', getCustomAttributeBy(AgisProductCustomAttributeCode.FISCAL_CLASSIFICATION, item)),
            active: getFromConfig('active', true),
            partial_update: getFromConfig('partial_update', false),
            allowed_to_import: getFromConfig('allowed_to_import', true)
        }
    }
}
