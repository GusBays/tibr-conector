import { isEmpty, isNotEmpty } from '../../../common/helpers/helper'
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
import { AgisSetting } from '../../setting/domain/agis/agis-setting'
import { SettingConnection } from '../../setting/domain/setting'
import { Fetcher } from './fetcher'

type GetParams = (page: number, size: number) => AgisPaginationParams
export class AgisProductFetcher extends Fetcher<AgisSetting> {
    protected async getData(): Promise<Resource[]> {
        const { token } = this.setting.config

        if (isEmpty(token)) return

        const request = new AgisRequest(this.setting.config.token)
        const pagination: GetParams = (page: number, size: number) => ({
            'searchCriteria[currentPage]': page,
            'searchCriteria[pageSize]': size
        })

        const { total_count } = await request.getProducts(pagination(1, 1))

        const pages = Math.ceil(total_count / 500)

        const resources: Resource[] = []

        for (let i = 1; i <= pages; i++) {
            const { items } = await request.getProducts(pagination(i, 500))

            const byAllowedToImport = (item: AgisProduct) => item.price >= this.setting.config.min_price
            const toResource = async (item: AgisProduct) => resources.push(await this.toResource(item))
            await Promise.all(items.filter(byAllowedToImport).map(toResource))
        }

        return resources
    }

    private async toResource(item: AgisProduct): Promise<Resource> {
        let resource: ProductResource

        try {
            const row = await this.resourceService.getOne({
                source: SettingConnection.AGIS,
                source_id: item.id,
                type: ResourceType.PRODUCT
            })
            resource = row as ProductResource
        } catch (e) {}

        const getConfigBy = (item: AgisProduct): ProductConfig => {
            const getCustomAttribute = (code: AgisProductCustomAttributeCode) => {
                const byCode = (attribute: AgisProductCustomAttribute) => attribute.attribute_code === code
                const customAttribute = item.custom_attributes.find(byCode)
                return isNotEmpty(customAttribute) && isNotEmpty(customAttribute.value) ? customAttribute.value : null
            }

            const toSumBalance = (current: number, stock: AgisProductStock) => stock.qty + current

            return {
                name: resource?.config.name ?? item.name,
                category_default_id: resource?.config.category_default_id ?? this.setting.config.category_default_id,
                description: resource.config?.description ?? getCustomAttribute(AgisProductCustomAttributeCode.DESCRIPTION),
                short_description:
                    resource.config?.short_description ??
                    getCustomAttribute(AgisProductCustomAttributeCode.SHORT_DESCRIPTION),
                markup: resource?.config.markup ?? 1,
                price: resource?.config.price ?? item.price * this.setting.config.markup,
                weight: resource?.config.weight ?? +getCustomAttribute(AgisProductCustomAttributeCode.GROSS_WEIGHT),
                height: resource?.config.height ?? +getCustomAttribute(AgisProductCustomAttributeCode.HEIGHT),
                width: resource?.config.width ?? +getCustomAttribute(AgisProductCustomAttributeCode.WIDTH),
                depth: resource?.config.depth ?? +getCustomAttribute(AgisProductCustomAttributeCode.DEPTH),
                balance: resource?.config.balance ?? item.stock.reduce(toSumBalance, 0),
                reference: resource?.config.reference,
                gtin: resource?.config.gtin ?? +getCustomAttribute(AgisProductCustomAttributeCode.GTIN),
                ncm: resource?.config.ncm ?? getCustomAttribute(AgisProductCustomAttributeCode.FISCAL_CLASSIFICATION),
                active: resource?.config.active ?? true,
                partial_update: resource?.config.partial_update ?? false,
                allowed_to_update: resource?.config.allowed_to_update ?? true
            }
        }

        if (isNotEmpty(resource)) {
            resource.source_payload = item
            resource.config = getConfigBy(item)
        } else {
            resource = {
                id: null,
                source: SettingConnection.AGIS,
                source_id: item.id,
                source_payload: item,
                type: ResourceType.PRODUCT,
                target: SettingConnection.BAGY,
                target_id: null,
                target_payload: null,
                config: getConfigBy(item),
                created_at: null,
                updated_at: null
            }
        }

        return resource
    }
}
