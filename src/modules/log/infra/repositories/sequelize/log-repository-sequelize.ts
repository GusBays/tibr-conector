import { FindOptions, Op, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { SequelizeRowsToPaginationAdapter } from '../../../../../common/db/infra/adapters/sequelize/sequelize-rows-to-pagination-adapter'
import { isNotEmpty } from '../../../../../common/helpers/helper'
import { Log as ILog, LogFilter } from '../../../domain/log'
import { LogRepository } from '../../../domain/log-repository'
import { Log } from './models/log'

@injectable()
export class LogRepositorySequelize implements LogRepository {
    async create(data: ILog): Promise<ILog> {
        const log = await Log.create(data)
        return log.toJSON()
    }

    async getPaginate(filter: LogFilter): Promise<any> {
        const query = this.interpret(filter)

        const { rows, count } = await Log.findAndCountAll(query)

        return new SequelizeRowsToPaginationAdapter(rows, query, count).getData()
    }

    async delete(filter: LogFilter): Promise<void> {
        await Log.destroy(this.interpret(filter))
    }

    private interpret(filter: LogFilter): FindOptions<ILog> {
        const where: WhereOptions<ILog> = {}

        const { id, connection_id, resource_id, created_before } = filter

        if (isNotEmpty(id)) where.id = id
        if (isNotEmpty(connection_id)) where.connection_id = connection_id
        if (isNotEmpty(resource_id)) where.resource_id = resource_id
        if (isNotEmpty(created_before)) where.created_at = { [Op.lt]: created_before }

        return { where }
    }
}
