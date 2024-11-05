import { isEmpty, isNotEmpty } from '../../../common/helpers/helper'
import { AgisPaginationParams } from '../../agis/domain/pagination'
import { AgisProduct } from '../../agis/domain/product'
import { AgisRequest } from '../../agis/infra/http/axios/agis-request'
import { ProductResource } from '../../resource/domain/product/product-resource'
import { Resource, ResourceType } from '../../resource/domain/resource'
import { AgisSetting } from '../../setting/domain/agis/agis-setting'
import { SettingConnection } from '../../setting/domain/setting'
import { Fetcher } from './fetcher'

type GetParams = (page: number, size: number) => AgisPaginationParams
export class AgisFetcher extends Fetcher<AgisSetting> {
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

            const toResource = async (item: AgisProduct) => resources.push(await this.toResource(item))
            await Promise.all(items.map(toResource))
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

        if (isNotEmpty(resource)) {
            resource.source_payload = item
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
                config: null,
                created_at: null,
                updated_at: null
            }
        }

        return resource
    }
}
