import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { History, HistoryFilter, HistoryTypeEnum } from './history'
import { HistoryRepository } from './history-repository'

@injectable()
export class HistoryService {
    constructor(@inject(HistoryTypeEnum.REPOSITORY) private readonly repository: HistoryRepository) {}

    static getInstance(): HistoryService {
        return container.resolve(HistoryTypeEnum.SERVICE)
    }

    async create(data: History): Promise<History> {
        return await this.repository.create(data)
    }

    async getPaginate(filter: HistoryFilter): Promise<Meta<History>> {
        return await this.repository.getPaginate(filter)
    }
}
