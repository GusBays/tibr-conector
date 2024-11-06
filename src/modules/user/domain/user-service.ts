import { compare, hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { container, inject, injectable } from 'tsyringe'
import { Meta } from '../../../common/contracts/contracts'
import { NotFound } from '../../../common/exceptions/not-found'
import { Unauthenticated } from '../../../common/exceptions/unauthenticated'
import { UnprocessableEntity } from '../../../common/exceptions/unprocessable-entity'
import { isEmpty, isNotEmpty, throwIf } from '../../../common/helpers/helper'
import { User, UserFilter, UserType, UserTypeEnum } from './user'
import { UserRepository } from './user-repository'

@injectable()
export class UserService {
    constructor(@inject(UserTypeEnum.REPOSITORY) private readonly repository: UserRepository) {}

    static getInstance(): UserService {
        return container.resolve(UserTypeEnum.SERVICE)
    }

    async create(data: User): Promise<User> {
        const key = process.env.APP_KEY

        data.token = sign({ email: data.email, type: data.type }, key)
        data.password = await hash(data.password, 10)

        return await this.repository.create(data)
    }

    async getPaginate(filter: UserFilter): Promise<Meta<User>> {
        return await this.repository.getPaginate(filter)
    }

    async getOne(filter: UserFilter): Promise<User> {
        const user = await this.repository.getOne(filter)
        throwIf(isEmpty(user), NotFound, ['user'])
        return user
    }

    async update(data: User): Promise<User> {
        if (isNotEmpty(data.email) || isNotEmpty(data.type)) {
            const user = await this.getOne({ id: data.id })
            data.token = sign({ email: data.email ?? user.email, type: data.type ?? user.type }, process.env.APP_KEY)
        }
        return await this.repository.update(data)
    }

    async delete(filter: UserFilter): Promise<void> {
        const user = await this.getOne(filter)
        throwIf(UserType.OWNER === user.type, UnprocessableEntity, [{ owner: 'cannot_delete_owner' }])

        return await this.repository.delete(filter)
    }

    async login(data: { email: string; password: string }): Promise<User> {
        const user = await this.getOne({ email: data.email })

        try {
            await compare(user.password, data.password)
        } catch (e) {
            throw new Unauthenticated()
        }

        return user
    }
}
