import { Connection, ConnectionType, FetcherConnection, ImporterConnection } from './connection'

export function isFetcher(data: Connection): data is FetcherConnection {
    return ConnectionType.FETCHER === data.type
}

export function isImporter(data: Connection): data is ImporterConnection {
    return ConnectionType.IMPORTER === data.type
}
