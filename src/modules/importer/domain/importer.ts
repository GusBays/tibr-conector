import { AxiosError } from 'axios'
import { Log } from '../../log/domain/log'
import { LogService } from '../../log/domain/log-service'
import { Resource } from '../../resource/domain/resource'
import { ConnectionApi, ImporterConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'

export abstract class Importer<I extends ImporterConnection = any> {
    abstract readonly api: ConnectionApi
    private logService: LogService = LogService.getInstance()

    constructor(protected setting: Setting, protected importer: I) {}

    abstract importOne(resource: Resource): Promise<Resource>

    protected async log(e: Error, resource?: Resource, payload?: Record<string, any>): Promise<void> {
        const message = e instanceof AxiosError ? e.response.data : { message: e.message, stack: e.stack }
        const connection_id = this.importer.id
        const resource_id = resource.id
        await this.logService.create({ message, connection_id, resource_id, payload } as Log)
    }
}
