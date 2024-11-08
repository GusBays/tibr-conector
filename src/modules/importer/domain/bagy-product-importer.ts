import { isNotEmpty } from '../../../common/helpers/helper'
import { BagyProduct } from '../../bagy/domain/bagy-product'
import { BagyVariation } from '../../bagy/domain/bagy-variation'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { isAgisFetcher } from '../../fetcher/domain/fetcher-helper'
import { ProductResource } from '../../resource/domain/product/product-resource'
import { BagyImporter } from '../../setting/domain/connection/bagy/bagy-connection'
import { Connection, ConnectionApi, FetcherConnection } from '../../setting/domain/connection/connection'
import { isFetcher } from '../../setting/domain/connection/connection-helper'
import { PricingSettingGroup, Setting } from '../../setting/domain/setting'
import { Importer } from './importer'

export class BagyProductImporter extends Importer<BagyImporter> {
    readonly api: ConnectionApi.BAGY

    private request: BagyRequest

    constructor(setting: Setting, importer: BagyImporter) {
        super(setting, importer)
        this.request = new BagyRequest(importer.config.token)
    }

    async importOne(resource: ProductResource): Promise<ProductResource> {
        const product = this.toBagyProduct(resource)

        if (isNotEmpty(product.id)) {
            const target_payload = await this.request.updateProduct(product)
            Object.assign(resource, { target_payload })
        } else {
            const res = await this.request.createProduct(product)
            Object.assign(resource, { target_id: res.id, target_payload: res })
        }

        return resource
    }

    private toBagyProduct(resource: ProductResource): BagyProduct {
        const byApi = (connection: Connection) => connection.api === resource.source && isFetcher(connection)
        const fetcher = this.setting.connections.find(byApi) as FetcherConnection

        const product: BagyProduct = {
            id: resource.target_id
        } as BagyProduct

        if (resource.config.partial_update && isNotEmpty(resource.target_payload)) {
            const toBalance = (variation: BagyVariation) =>
                ({ id: variation.id, balance: resource.config.balance } as BagyVariation)
            product.variations = (resource.target_payload as BagyProduct).variations.map(toBalance)
        } else {
            product.category_default_id = resource.config.category_default_id
            product.name = resource.config.name
            product.short_description = resource.config.short_description
            product.description = resource.config.description

            if (isAgisFetcher(fetcher)) {
                const markup = isNotEmpty(resource.config.markup) ? resource.config.markup : fetcher.config.markup
                product.price = resource.config.price * markup
            } else {
                product.price = resource.config.price
            }

            product.active = resource.config.active
            product.short_description = resource.config.short_description
            product.external_id = resource.source_id.toString()
            product.ncm = resource.config.ncm
            product.category_ids = resource.config.category_ids ?? [resource.config.category_default_id]
            product.feature_ids = resource.config.feature_ids

            const toVariation = (group: PricingSettingGroup) => {
                const variation: BagyVariation = {
                    product_id: product.id,
                    price: product.price * group.markup,
                    price_compare: null,
                    attribute_value_id: group.attribute_value_id,
                    attribute_value_secondary_id: null,
                    balance: resource.config.balance,
                    position: group.position
                } as BagyVariation

                if (isNotEmpty(resource.target_payload)) {
                    const byAttributeValueId = (variation: BagyVariation) =>
                        variation.attribute_value_id === group.attribute_value_id
                    const variationOnBagy = (resource.target_payload as BagyProduct).variations?.find(byAttributeValueId)
                    variation.id = variationOnBagy.id
                }

                return variation
            }
            product.variations = this.setting.pricing.groups.map(toVariation)
        }

        return product
    }
}
