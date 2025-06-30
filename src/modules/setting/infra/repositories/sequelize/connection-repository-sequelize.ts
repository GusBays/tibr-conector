import { FindOptions, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { isNotEmpty } from '../../../../../common/helpers/helper'
import { ConnectionFilter, Connection as IConnection } from '../../../domain/connection/connection'
import { ConnectionRepository } from '../../../domain/connection/connection-repository'
import { Connection } from './models/connection'

@injectable()
export class ConnectionRepositorySequelize implements ConnectionRepository {
    async create(data: IConnection): Promise<IConnection> {
        const connection = await Connection.create(data)
        return connection.toJSON()
    }

    async update(data: IConnection): Promise<IConnection> {
        const filter = { id: data.id }
        await Connection.update(data, { where: filter })
        return await this.getOne(filter)
    }

    async getOne(filter: ConnectionFilter): Promise<IConnection> {
        const connection = await Connection.findOne(this.interpret(filter))
        return connection?.toJSON()
    }

    async delete(filter: ConnectionFilter): Promise<void> {
        await Connection.destroy(this.interpret(filter))
    }

    private interpret(filter: ConnectionFilter): FindOptions<IConnection> {
        const where: WhereOptions<IConnection> = {}

        const { id, setting_id, api, type, status } = filter

        if (isNotEmpty(id)) where.id = id
        if (isNotEmpty(setting_id)) where.setting_id = setting_id
        if (isNotEmpty(api)) where.api = api
        if (isNotEmpty(type)) where.type = type
        if (isNotEmpty(status)) where.status = status

        return { where }
    }
}
