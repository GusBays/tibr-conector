import { Agent } from 'https'
import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'
import { BagyAttribute } from '../../../domain/bagy-attribute'
import { BagyCategory } from '../../../domain/bagy-category'
import { BagyPagination, BagyParams } from '../../../domain/bagy-pagination'
import { BagyProduct } from '../../../domain/bagy-product'
import { BagyWebhook } from '../../../domain/bagy-webhook'

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

    async deleteProductImage(productId: number, imageId: number): Promise<void> {
        await this.delete(`/products/${productId}/images/${imageId}`)
    }

    async getAttributes(params: BagyParams): Promise<BagyPagination<BagyAttribute>> {
        return await this.get<BagyPagination>('/attributes', { params })
    }

    async getAttribute(id: number): Promise<BagyAttribute> {
        return await this.get<BagyAttribute>(`/attributes/${id}`)
    }

    async createAttribute(data: BagyAttribute): Promise<BagyAttribute> {
        return await this.post<BagyAttribute, BagyAttribute>('/attributes', data)
    }

    async getWebhooks(data: BagyParams): Promise<BagyPagination<BagyWebhook>> {
        return await this.get<BagyPagination>('/webhooks', { params: data })
    }

    async createWebhook(data: BagyWebhook): Promise<BagyWebhook> {
        return await this.post<BagyWebhook, BagyWebhook>('/webhooks', data)
    }

    async getCategories(params?: BagyParams): Promise<BagyPagination<BagyCategory>> {
        return await this.get<BagyPagination>('/categories', { params })
    }

    async getCategory(id: number): Promise<BagyCategory> {
        return await this.get<BagyCategory>(`/categories/${id}`)
    }
}
