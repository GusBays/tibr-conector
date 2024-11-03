import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { CategoriesBelongs } from '../../../domain/category'
import { BagyProduct } from '../../../domain/product'

export class BagyRequest extends AxiosRequest {
    constructor(token: string) {
        super({
            baseURL: process.env.BAGY_API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
    }

    async createProduct(data: BagyProduct & CategoriesBelongs): Promise<BagyProduct> {
        return await this.post<BagyProduct & CategoriesBelongs, BagyProduct>('/products', data)
    }

    async getProduct(id: number): Promise<BagyProduct> {
        return await this.get<BagyProduct>(`/products/${id}`)
    }

    async updateProduct(data: BagyProduct & CategoriesBelongs): Promise<BagyProduct> {
        return await this.put<BagyProduct & CategoriesBelongs, BagyProduct>(`/products/${data.id}`, data)
    }
}
