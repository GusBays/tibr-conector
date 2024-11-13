import { Agent } from 'https'
import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { AgisPagination, AgisPaginationParams } from '../../../domain/agis-pagination'
import { AgisProduct } from '../../../domain/agis-product'

export class AgisRequest extends AxiosRequest {
    constructor(token: string) {
        const httpsAgent = new Agent({ keepAlive: true })

        super({
            baseURL: process.env.AGIS_API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            httpsAgent
        })
    }

    async getProducts(params: AgisPaginationParams): Promise<AgisPagination<AgisProduct>> {
        return await this.get<AgisPagination<AgisProduct>>('/rest/all/V1/agis/reseller/product/list', params)
    }

    async getProductImage(url: string): Promise<NodeJS.ArrayBufferView> {
        return await this.get<NodeJS.ArrayBufferView>(`/media/catalog/product/${url}`, { responseType: 'arraybuffer' })
    }
}
