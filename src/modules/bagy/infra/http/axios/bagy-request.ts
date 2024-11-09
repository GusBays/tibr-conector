import { Agent } from 'https'
import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { BagyAttribute } from '../../../domain/bagy-attribute'
import { BagyPagination, BagyParams } from '../../../domain/bagy-pagination'
import { BagyProduct } from '../../../domain/bagy-product'

export class BagyRequest extends AxiosRequest {
    constructor(token: string) {
        const httpsAgent = new Agent({ keepAlive: true })

        super({
            baseURL: process.env.BAGY_API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            httpsAgent
        })
    }

    async createProduct(data: BagyProduct): Promise<BagyProduct> {
        return await this.post<BagyProduct, BagyProduct>('/products', data)
    }

    async updateProduct(data: BagyProduct): Promise<BagyProduct> {
        return await this.put<BagyProduct, BagyProduct>(`/products/${data.id}`, data)
    }

    async getAttributes(params: BagyParams): Promise<BagyPagination<BagyAttribute>> {
        return await this.get<BagyPagination>('/attributes', params)
    }

    async getAttribute(id: number): Promise<BagyAttribute> {
        return await this.get<BagyAttribute>(`/attributes/${id}`)
    }

    async createAttribute(data: BagyAttribute): Promise<BagyAttribute> {
        return await this.post<BagyAttribute, BagyAttribute>('/attributes', data)
    }
}
