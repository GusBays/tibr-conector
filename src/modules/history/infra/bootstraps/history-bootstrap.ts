import { container } from 'tsyringe'
import { HistoryTypeEnum } from '../../domain/history'
import { HistoryService } from '../../domain/history-service'
import { HistoryRepositorySequelize } from '../repositories/sequelize/history-repository-sequelize'

export async function historyBootstrap(): Promise<void> {
    container.register(HistoryTypeEnum.SERVICE, HistoryService)
    container.register(HistoryTypeEnum.REPOSITORY, HistoryRepositorySequelize)
}
