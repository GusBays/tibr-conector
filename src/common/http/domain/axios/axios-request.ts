import axios, { Axios, AxiosRequestConfig, CreateAxiosDefaults } from 'axios'

export class AxiosRequest {
    protected client: Axios

    constructor(config: CreateAxiosDefaults) {
        this.client = axios.create(config)
    }

    async post<T = any, R = any>(path: string, data: T): Promise<R> {
        const response = await this.client.post<R>(path, data)
        return response.data
    }

    async get<R = any>(path: string, config?: AxiosRequestConfig): Promise<R> {
        const response = await this.client.get<R>(path, config)
        return response.data
    }

    async put<T = any, R = any>(path: string, data: T): Promise<R> {
        const response = await this.client.put<R>(path, data)
        return response.data
    }
}
