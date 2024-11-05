import { container } from 'tsyringe'
import { ConnectionTypeEnum } from '../../domain/connection/connection'
import { ConnectionService } from '../../domain/connection/connection-service'
import { ConnectionRepositorySequelize } from '../repositories/sequelize/connection-repository-sequelize'

export async function connectionBootstrap(): Promise<void> {
    container.register(ConnectionTypeEnum.SERVICE, ConnectionService)
    container.register(ConnectionTypeEnum.REPOSITORY, ConnectionRepositorySequelize)
}
