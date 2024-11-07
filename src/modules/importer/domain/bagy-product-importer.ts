import { format } from 'date-fns'
import { isEmpty, isNotEmpty, not } from '../../../common/helpers/helper'
import { BagyProduct } from '../../bagy/domain/bagy-product'
import { BagyVariation } from '../../bagy/domain/bagy-variation'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { isAgisFetcher } from '../../fetcher/domain/fetcher-helper'
import { HistoryType, ImportHistory } from '../../history/domain/history'
import { ProductResource } from '../../resource/domain/product/product-resource'
import { ResourceType } from '../../resource/domain/resource'
import { BagyImporter } from '../../setting/domain/connection/bagy/bagy-connection'
import { Connection, FetcherConnection } from '../../setting/domain/connection/connection'
import { isFetcher } from '../../setting/domain/connection/connection-helper'
import { PricingSettingGroup } from '../../setting/domain/setting'
import { Importer } from './importer'

export class BagyProductImporter extends Importer<BagyImporter> {
    async import(): Promise<void> {
        const { active, config } = this.importer

        if (not(active) || isEmpty(config.token)) return

        const request = new BagyRequest(config.token)

        const history: ImportHistory = {
            id: null,
            connection: this.importer.api,
            type: HistoryType.IMPORT,
            started_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            ended_at: null,
            extra: {
                created: 0,
                updated: 0,
                errors: 0
            },
            created_at: null,
            updated_at: null
        }

        const resources = await this.getResourcesBy<ProductResource>(ResourceType.PRODUCT)

        const byAllowedToImport = (resource: ProductResource) => resource.config.allowed_to_import
        const allowed = resources.filter(byAllowedToImport)

        if (isEmpty(allowed)) return

        const toImportAndUpdate = async (resource: ProductResource) => {
            const byApi = (connection: Connection) => connection.api === resource.source && isFetcher(connection)
            const fetcher = this.setting.connections.find(byApi)

            const product = this.toBagyProduct(resource, fetcher as FetcherConnection)

            try {
                if (isNotEmpty(product.id)) {
                    const target_payload = await request.updateProduct(product)
                    Object.assign(resource, { target_payload })
                    history.extra.updated++
                } else {
                    const res = await request.createProduct(product)
                    Object.assign(resource, { target_id: res.id, target_payload: res })
                    history.extra.created++
                }

                await this.resourceService.update(resource)
            } catch (e) {
                history.extra.errors++
            }
        }
        await Promise.all(allowed.map(toImportAndUpdate))

        history.ended_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.historyService.create(history)
    }

    private toBagyProduct(resource: ProductResource, fetcher: FetcherConnection) {
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
