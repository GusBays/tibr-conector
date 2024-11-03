import { container } from 'tsyringe'
import { UserTypeEnum } from '../../domain/user'
import { UserService } from '../../domain/user-service'
import { UserRepositorySequelize } from '../repositories/sequelize/user-repository-sequelize'

export async function userBootstrap(): Promise<void> {
    container.register(UserTypeEnum.SERVICE, UserService)
    container.register(UserTypeEnum.REPOSITORY, UserRepositorySequelize)
}
