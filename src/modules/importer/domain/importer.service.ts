import { container, injectable } from 'tsyringe'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, throwIf } from '../../../common/helpers/helper'
import { ResourceType } from '../../resource/domain/resource'
import { Connection, ImporterConnection } from '../../setting/domain/connection/connection'
import { SettingService } from '../../setting/domain/setting-service'
import { ImporterTypeEnum } from './importer'
import { ImporterStrategyFactory } from './strategies/importer.strategy.factory'

@injectable()
export class ImporterService {
    static getInstance(): ImporterService {
        return container.resolve(ImporterTypeEnum.SERVICE)
    }

    async import(id: number, resource: ResourceType): Promise<void> {
        const setting = await SettingService.getInstance().getOne({})

        const byId = (connection: Connection) => +connection.id === +id
        const importer = setting.connections.find(byId) as ImporterConnection

        throwIf(isEmpty(importer), NotFound, 'importer')

        await ImporterStrategyFactory.getInstance(resource, setting, importer).import()
    }
}
