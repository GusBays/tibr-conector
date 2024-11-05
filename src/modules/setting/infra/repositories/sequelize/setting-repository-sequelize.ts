import { FindOptions, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { Meta } from '../../../../../common/contracts/contracts'
import { SequelizeHelper } from '../../../../../common/db/domain/sequelize/sequelize-helper'
import { SequelizeRowsToPaginationAdapter } from '../../../../../common/db/infra/adapters/sequelize/sequelize-rows-to-pagination-adapter'
import { isNotEmpty } from '../../../../../common/helpers/helper'
import { Setting as ISetting, SettingFilter } from '../../../domain/setting'
import { SettingRepository } from '../../../domain/setting-repository'
import { Setting } from './models/setting'

@injectable()
export class SettingRepositorySequelize implements SettingRepository {
    async create(data: ISetting): Promise<ISetting> {
        const setting = await Setting.create(data)
        return setting.toJSON()
    }

    async getPaginate(filter: SettingFilter): Promise<Meta<ISetting>> {
        const query = this.interpret(filter)
        SequelizeHelper.setPaginationOn(query, filter)

        const { rows, count } = await Setting.findAndCountAll(query)

        return new SequelizeRowsToPaginationAdapter(rows, query, count).getData()
    }

    async getOne(filter: SettingFilter): Promise<ISetting> {
        const setting = await Setting.findOne(this.interpret(filter))
        return setting?.toJSON()
    }

    async update(data: Setting): Promise<ISetting> {
        const filter = { id: data.id }
        await Setting.update(data, { where: filter })
        return await this.getOne(filter)
    }

    async getAll(filter: SettingFilter): Promise<ISetting[]> {
        const settings = await Setting.findAll(this.interpret(filter))
        const toJSON = (row: Setting) => row.toJSON()
        return settings.map(toJSON)
    }

    private interpret(filter: SettingFilter): FindOptions<ISetting> {
        const where: WhereOptions<ISetting> = {}

        const { id, connection, active } = filter

        if (isNotEmpty(id)) where.id = id
        if (isNotEmpty(connection)) where.connection = connection
        if (isNotEmpty(active)) where.active = active

        return { where }
    }
}
