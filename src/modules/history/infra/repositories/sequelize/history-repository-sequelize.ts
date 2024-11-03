import { FindOptions, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { Meta } from '../../../../../common/contracts/contracts'
import { SequelizeHelper } from '../../../../../common/db/domain/sequelize/sequelize-helper'
import { SequelizeRowsToPaginationAdapter } from '../../../../../common/db/infra/adapters/sequelize/sequelize-rows-to-pagination-adapter'
import { isNotEmpty } from '../../../../../common/helpers/helper'
import { HistoryFilter, History as IHistory } from '../../../domain/history'
import { HistoryRepository } from '../../../domain/history-repository'
import { History } from './models/history'

@injectable()
export class HistoryRepositorySequelize implements HistoryRepository {
    async create(data: IHistory): Promise<IHistory> {
        const history = await History.create(data)
        return history.toJSON()
    }

    async getPaginate(filter: HistoryFilter): Promise<Meta<IHistory>> {
        const query = this.interpret(filter)
        SequelizeHelper.setPaginationOn(query, filter)

        const { rows, count } = await History.findAndCountAll(query)

        return new SequelizeRowsToPaginationAdapter(rows, query, count).getData()
    }

    private interpret(filter: HistoryFilter): FindOptions<IHistory> {
        const where: WhereOptions<IHistory> = {}

        const { id } = filter

        if (isNotEmpty(id)) where.id = id

        return { where }
    }
}
