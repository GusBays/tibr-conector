import { Resource } from '../../resource/domain/resource'
import { ConnectionApi, ImporterConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'

export abstract class Importer<I extends ImporterConnection = any> {
    abstract readonly api: ConnectionApi

    constructor(protected setting: Setting, protected importer: I) {}

    abstract importOne(resource: Resource): Promise<Resource>
}
