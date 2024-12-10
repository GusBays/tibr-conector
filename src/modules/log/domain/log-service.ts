import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { Log, LogFilter, LogTypeEnum } from './log'
import { LogRepository } from './log-repository'

@injectable()
export class LogService {
    constructor(@inject(LogTypeEnum.REPOSITORY) private readonly repository: LogRepository) {}

    static getInstance(): LogService {
        return container.resolve(LogTypeEnum.SERVICE)
    }

    async create(data: Log): Promise<Log> {
        return await this.repository.create(data)
    }

    async getPaginate(filter: LogFilter): Promise<Meta<Log>> {
        return await this.repository.getPaginate(filter)
    }

    async delete(filter: LogFilter): Promise<void> {
        await this.repository.delete(filter)
    }
}
