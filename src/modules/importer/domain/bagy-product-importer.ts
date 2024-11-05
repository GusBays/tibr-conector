import { format } from 'date-fns'
import { isEmpty, isNotEmpty, not } from '../../../common/helpers/helper'
import { BagyProduct } from '../../bagy/domain/product'
import { BagyVariation } from '../../bagy/domain/variation'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { HistoryType, ImportHistory } from '../../history/domain/history'
import { ProductResource } from '../../resource/domain/product/product-resource'
import { ResourceType } from '../../resource/domain/resource'
import { BagyImporter } from '../../setting/domain/connection/bagy/bagy-connection'
import { ConnectionApi } from '../../setting/domain/connection/connection'
import { PricingSettingGroup } from '../../setting/domain/setting'
import { Importer } from './importer'

export class BagyProductImporter extends Importer<BagyImporter> {
    async import(): Promise<void> {
        const { token } = this.importer.config

        if (isEmpty(token)) return

        const request = new BagyRequest(this.importer.config.token)

        const history: ImportHistory = {
            id: null,
            connection: this.importer.api,
            type: HistoryType.IMPORT,
            started_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            ended_at: null,
            extra: {
                success: 0,
                errors: 0
            },
            created_at: null,
            updated_at: null
        }

        const resources = await this.resourceService.getAll({
            type: ResourceType.PRODUCT,
            target: ConnectionApi.BAGY
        })

        const toImportAndUpdate = async (resource: ProductResource) => {
            if (not(resource.config.allowed_to_update)) return

            const product: BagyProduct = {} as BagyProduct

            if (resource.config.partial_update && isNotEmpty(resource.target_payload)) {
                const toBalance = (variation: BagyVariation) =>
                    ({ id: variation.id, balance: resource.config.balance } as BagyVariation)
                product.variations = (resource.target_payload as BagyProduct).variations.map(toBalance)
            } else {
                product.category_default_id = resource.config.category_default_id
                product.name = resource.config.name
                product.description = resource.config.description
                product.active = resource.config.active
                product.short_description = resource.config.short_description
                product.external_id = resource.source_id.toString()
                product.ncm = resource.config.ncm
                product.category_ids = resource.config.category_ids ?? [resource.config.category_default_id]
                product.feature_ids = resource.config.feature_ids

                const toVariation = (group: PricingSettingGroup) => {
                    const variation: BagyVariation = {
                        id: null,
                        product_id: resource.target_id,
                        price: product.price * group.markup,
                        price_compare: null,
                        color_id: null,
                        attribute_value_id: group.attribute_value_id,
                        attribute_value_secondary_id: null,
                        balance: resource.config.balance,
                        position: null,
                        created_at: null,
                        updated_at: null
                    }

                    if (resource.target_payload) {
                        const byAttributeValueId = (variation: BagyVariation) =>
                            variation.attribute_value_id === group.attribute_value_id
                        variation.id = (resource.target_payload as BagyProduct).variations?.find(byAttributeValueId)?.id
                    }

                    return variation
                }
                product.variations = this.setting.pricing.groups.map(toVariation)
            }

            try {
                const res = isNotEmpty(resource.target_id)
                    ? await request.updateProduct(product)
                    : await request.createProduct(product)

                await this.resourceService.update({ ...resource, target_id: res.id, target_payload: res })
                history.extra.success++
            } catch (e) {
                history.extra.errors++
            }
        }
        await Promise.all(resources.map(toImportAndUpdate))

        history.ended_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.historyService.create(history)
    }
}
