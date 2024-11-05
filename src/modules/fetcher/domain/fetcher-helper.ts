import { AgisFetcher } from '../../setting/domain/connection/agis/agis-connection'
import { Connection, ConnectionApi } from '../../setting/domain/connection/connection'
import { isFetcher } from '../../setting/domain/connection/connection-helper'

export function isAgisFetcher(data: Connection): data is AgisFetcher {
    return isFetcher(data) && data.api === ConnectionApi.AGIS
}
