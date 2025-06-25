import { FindOptions, Op, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { Meta } from '../../../../../common/contracts/contracts'
import { SequelizeHelper } from '../../../../../common/db/domain/sequelize/sequelize-helper'
import { SequelizeRowsToPaginationAdapter } from '../../../../../common/db/infra/adapters/sequelize/sequelize-rows-to-pagination-adapter'
import { isNotEmpty } from '../../../../../common/helpers/helper'
import { User as IUser, UserFilter } from '../../../domain/user'
import { UserRepository } from '../../../domain/user-repository'
import { User } from './models/user'

@injectable()
export class UserRepositorySequelize implements UserRepository {
    async create(data: IUser): Promise<IUser> {
        const user = await User.create(data)
        return user.toJSON()
    }

    async getPaginate(filter: UserFilter): Promise<Meta<IUser>> {
        const query = await this.interpret(filter)
        SequelizeHelper.setPaginationOn(query, filter)

        const { rows, count } = await User.findAndCountAll(query)

        return new SequelizeRowsToPaginationAdapter(rows, query, count).getData()
    }

    async getOne(filter: UserFilter): Promise<IUser> {
        const user = await User.findOne(this.interpret(filter))
        return user?.toJSON()
    }

    async update(data: IUser): Promise<IUser> {
        const filter = { id: data.id }
        await User.update(data, { where: filter })
        return await this.getOne(filter)
    }

    async delete(filter: UserFilter): Promise<void> {
        await User.destroy(this.interpret(filter))
    }

    async getAll(filter: UserFilter): Promise<IUser[]> {
        const users = await User.findAll(this.interpret(filter))
        const toJSON = (user: User) => user.toJSON()
        return users.map(toJSON)
    }

    private interpret(filter: UserFilter): FindOptions<IUser> {
        const where: WhereOptions<IUser> = {}

        const { id, email, type, types, active, token, q } = filter

        if (isNotEmpty(id)) where.id = id
        if (isNotEmpty(email)) where.email = email
        if (isNotEmpty(type)) where.type = type
        if (isNotEmpty(types)) where.type = { [Op.in]: types }
        if (isNotEmpty(active)) where.active = Boolean(active)
        if (isNotEmpty(token)) where.token = token
        if (isNotEmpty(q)) {
            const pattern = `%${q}%`
            where[Op.or] = { first_name: { [Op.like]: pattern }, email: { [Op.like]: pattern } }
        }

        return { where }
    }
}
