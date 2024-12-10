import { container } from 'tsyringe'
import { LogTypeEnum } from '../../domain/log'
import { LogService } from '../../domain/log-service'
import { LogRepositorySequelize } from '../repositories/sequelize/log-repository-sequelize'

export async function logBootstrap(): Promise<void> {
    container.register(LogTypeEnum.SERVICE, LogService)
    container.register(LogTypeEnum.REPOSITORY, LogRepositorySequelize)
}
