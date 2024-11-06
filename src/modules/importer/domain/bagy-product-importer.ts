import { format } from 'date-fns'
import { isEmpty, isNotEmpty, not } from '../../../common/helpers/helper'
import { BagyProduct } from '../../bagy/domain/product'
import { BagyVariation } from '../../bagy/domain/variation'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { HistoryType, ImportHistory } from '../../history/domain/history'
import { ProductResource } from '../../resource/domain/product/product-resource'
import { ResourceType } from '../../resource/domain/resource'
import { BagyImporter } from '../../setting/domain/connection/bagy/bagy-connection'
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

        const resources = await this.getResourcesBy(ResourceType.PRODUCT)

        const byAllowedToUpdate = (resource: ProductResource) => resource.config.allowed_to_import
        const toImportAndUpdate = async (resource: ProductResource) => {
            const product: BagyProduct = {} as BagyProduct

            if (resource.config.partial_update && isNotEmpty(resource.target_payload)) {
                const toBalance = (variation: BagyVariation) =>
                    ({ id: variation.id, balance: resource.config.balance } as BagyVariation)
                product.variations = (resource.target_payload as BagyProduct).variations.map(toBalance)
            } else {
                product.id = resource.target_id
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
                        product_id: resource.target_id,
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

            try {
                if (isNotEmpty(resource.target_id)) {
                    const target_payload = await request.updateProduct(product)
                    Object.assign(resource, { target_payload })
                    history.extra.created++
                } else {
                    const res = await request.createProduct(product)
                    Object.assign(resource, { target_id: res.id, target_payload: res })
                    history.extra.updated++
                }

                await this.resourceService.update(resource)
            } catch (e) {
                history.extra.errors++
            }
        }
        await Promise.all(resources.filter(byAllowedToUpdate).map(toImportAndUpdate))

        history.ended_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        await this.historyService.create(history)
    }
}
