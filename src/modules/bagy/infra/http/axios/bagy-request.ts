import { Agent } from 'https'
import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { BagyProduct } from '../../../domain/product'

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

    async getProduct(id: number): Promise<BagyProduct> {
        return await this.get<BagyProduct>(`/products/${id}`)
    }

    async updateProduct(data: BagyProduct): Promise<BagyProduct> {
        return await this.put<BagyProduct, BagyProduct>(`/products/${data.id}`, data)
    }
}
