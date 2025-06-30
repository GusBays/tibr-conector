import { container, inject, injectable } from 'tsyringe'
import { Connection, ConnectionFilter, ConnectionTypeEnum } from './connection'
import { ConnectionRepository } from './connection-repository'

@injectable()
export class ConnectionService {
    constructor(@inject(ConnectionTypeEnum.REPOSITORY) private readonly repository: ConnectionRepository) {}

    static getInstance(): ConnectionService {
        return container.resolve(ConnectionTypeEnum.SERVICE)
    }

    async create(data: Connection): Promise<Connection> {
        return await this.repository.create(data)
    }

    async update(data: Connection): Promise<void> {
        await this.repository.update(data)
    }

    async delete(filter: ConnectionFilter): Promise<void> {
        await this.repository.delete(filter)
    }
}
