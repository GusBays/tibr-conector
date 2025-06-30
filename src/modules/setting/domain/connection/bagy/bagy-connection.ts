import { ConnectionApi, ImporterConnection } from '../connection'

export interface BagyImporter extends ImporterConnection {
    api: ConnectionApi.BAGY
    config: BagyConfig
}

interface BagyConfig {
    token: string
    category_default_id: number
}
