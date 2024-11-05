import { BagyImporter } from '../../setting/domain/connection/bagy/bagy-connection'
import { Connection, ConnectionApi } from '../../setting/domain/connection/connection'
import { isImporter } from '../../setting/domain/connection/connection-helper'

export function isBagyImporter(data: Connection): data is BagyImporter {
    return isImporter(data) && data.api === ConnectionApi.BAGY
}
