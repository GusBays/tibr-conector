import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, throwIf } from '../../../common/helpers/helper'
import { Setting, SettingFilter, SettingTypeEnum } from './setting'
import { SettingRepository } from './setting-repository'

@injectable()
export class SettingService {
    constructor(@inject(SettingTypeEnum.REPOSITORY) private readonly repository: SettingRepository) {}

    static getInstance(): SettingService {
        return container.resolve(SettingTypeEnum.SERVICE)
    }

    async create(data: Setting): Promise<Setting> {
        return await this.repository.create(data)
    }

    async getOne(filter: SettingFilter): Promise<Setting> {
        const setting = await this.repository.getOne(filter)
        throwIf(isEmpty(setting), NotFound, ['setting'])
        return setting
    }

    async getPaginate(filter: SettingFilter): Promise<Meta<Setting>> {
        return await this.repository.getPaginate(filter)
    }

    async update(data: Setting): Promise<Setting> {
        return await this.repository.update(data)
    }

    async getAll(filter: SettingFilter): Promise<Setting[]> {
        return await this.repository.getAll(filter)
    }
}
