import { Agent } from 'https'
import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { AgisPagination, AgisPaginationParams, AgisProductParams } from '../../../domain/agis-pagination'
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
        return await this.get<AgisPagination<AgisProduct>>('/rest/all/V1/agis/reseller/product/list', { params })
    }

    async getProduct(sku: string): Promise<AgisProduct> {
        const params: AgisProductParams = {
            'searchCriteria[filterGroups][0][filters][0][field]': 'SKU',
            'searchCriteria[filterGroups][0][filters][0][value]': sku
        }

        return await this.get<AgisProduct>('/rest/all/V1/agis/reseller/product/list', { params })
    }

    async getProductImage(url: string): Promise<NodeJS.ReadableStream> {
        return await this.get<NodeJS.ReadableStream>(`/media/catalog/product/${url}`, { responseType: 'stream' })
    }
}
