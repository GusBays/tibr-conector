import { Agent } from 'https'
import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { AgisPagination, AgisPaginationParams } from '../../../domain/pagination'
import { AgisProduct } from '../../../domain/product'

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
}
