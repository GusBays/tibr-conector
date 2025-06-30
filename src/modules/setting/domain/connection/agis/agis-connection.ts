import { ConnectionApi, FetcherConnection } from '../connection'

export interface AgisFetcher extends FetcherConnection {
    api: ConnectionApi.AGIS
    config: AgisConfig
}

interface AgisConfig {
    markup: number
    token: string
    min_price: number
    min_stock: number
    weight_default: number
}
