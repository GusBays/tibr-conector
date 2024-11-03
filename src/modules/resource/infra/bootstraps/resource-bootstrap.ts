import { container } from 'tsyringe'
import { ResourceTypeEnum } from '../../domain/resource'
import { ResourceService } from '../../domain/resource-service'
import { ResourceRepositorySequelize } from '../repositories/sequelize/resource-repository-sequelize'

export async function resourceBootstrap(): Promise<void> {
    container.register(ResourceTypeEnum.SERVICE, ResourceService)
    container.register(ResourceTypeEnum.REPOSITORY, ResourceRepositorySequelize)
}
