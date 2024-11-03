import axios, { Axios, CreateAxiosDefaults } from 'axios'

export class AxiosRequest {
    protected client: Axios

    constructor(config: CreateAxiosDefaults) {
        this.client = axios.create(config)
    }

    protected async post<T = any, R = any>(path: string, data: T): Promise<R> {
        const response = await this.client.post<R>(path, data)
        return response.data
    }

    protected async get<R = any>(path: string, params: Record<string, any> = {}): Promise<R> {
        const response = await this.client.get<R>(path, { params })
        return response.data
    }

    protected async put<T = any, R = any>(path: string, data: T): Promise<R> {
        const response = await this.client.post<R>(path, data)
        return response.data
    }
}
