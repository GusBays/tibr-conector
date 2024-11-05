import { Connection, ConnectionApi, FetcherConnection } from '../connection'

export interface AgisConnection extends Connection {
    api: ConnectionApi.AGIS
    config: AgisConfig
}

export interface AgisFetcher extends FetcherConnection {
    api: ConnectionApi.AGIS
    config: AgisConfig
}

interface AgisConfig {
    markup: number
    token: string
    min_price: number
    category_default_id: number
    weight_default: number
}
