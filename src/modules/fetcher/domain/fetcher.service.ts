import { container, injectable } from 'tsyringe'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, throwIf } from '../../../common/helpers/helper'
import { ResourceType } from '../../resource/domain/resource'
import { Connection, FetcherConnection } from '../../setting/domain/connection/connection'
import { SettingService } from '../../setting/domain/setting-service'
import { FetcherTypeEnum } from './fetcher'
import { FetcherStrategyFactory } from './strategies/fetcher.strategy.factory'

@injectable()
export class FetcherService {
    static getInstance(): FetcherService {
        return container.resolve(FetcherTypeEnum.SERVICE)
    }

    async fetch(id: number, resource: ResourceType): Promise<void> {
        const setting = await SettingService.getInstance().getOne({})

        const byId = (connection: Connection) => +connection.id === +id
        const fetcher = setting.connections.find(byId) as FetcherConnection

        throwIf(isEmpty(fetcher), NotFound, 'fetcher')

        await FetcherStrategyFactory.getInstance(resource, setting, fetcher).fetch()
    }
}
