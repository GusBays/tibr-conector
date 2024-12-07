import { Connection, ConnectionApi, ImporterConnection } from '../connection'

export interface BagyConnection extends Connection {
    api: ConnectionApi.BAGY
    config: BagyConfig
}

export interface BagyImporter extends ImporterConnection {
    api: ConnectionApi.BAGY
    config: BagyConfig
}

interface BagyConfig {
    token: string
    category_default_id: number
}
