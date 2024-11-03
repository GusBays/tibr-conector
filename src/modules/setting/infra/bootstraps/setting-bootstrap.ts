import { container } from 'tsyringe'
import { SettingTypeEnum } from '../../domain/setting'
import { SettingService } from '../../domain/setting-service'
import { SettingRepositorySequelize } from '../repositories/sequelize/setting-repository-sequelize'

export async function settingBootstrap(): Promise<void> {
    container.register(SettingTypeEnum.SERVICE, SettingService)
    container.register(SettingTypeEnum.REPOSITORY, SettingRepositorySequelize)
}
