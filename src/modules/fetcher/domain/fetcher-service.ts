import { container, injectable } from 'tsyringe'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, not } from '../../../common/helpers/helper'
import { ResourceType } from '../../resource/domain/resource'
import { Connection, FetcherConnection } from '../../setting/domain/connection/connection'
import { isFetcher } from '../../setting/domain/connection/connection-helper'
import { SettingService } from '../../setting/domain/setting-service'
import { FetcherFactory } from './fetcher-factory'
import { FetcherTypeEnum } from './fetcher-types'

@injectable()
export class FetcherService {
    static getInstance(): FetcherService {
        return container.resolve(FetcherTypeEnum.SERVICE)
    }

    async fetch(id: number, resource: ResourceType): Promise<void> {
        const setting = await SettingService.getInstance().getOne({})

        const byId = (connection: Connection) => +connection.id === +id
        const fetcher = setting.connections.find(byId) as FetcherConnection

        if (isEmpty(fetcher) || not(fetcher.active) || false === isFetcher(fetcher)) {
            throw new NotFound('fetcher')
        }

        await FetcherFactory.getInstance(resource, setting, fetcher).fetch()
    }
}
