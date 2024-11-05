import { NotImplemented } from '../../../common/exceptions/not-implemented'
import { ResourceType } from '../../resource/domain/resource'
import { FetcherConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'
import { AgisProductFetcher } from './agis-product-fetcher'
import { Fetcher } from './fetcher'
import { isAgisFetcher } from './fetcher-helper'

export class FetcherFactory {
    static getInstance(type: ResourceType, setting: Setting, fetcher: FetcherConnection): Fetcher {
        switch (type) {
            case ResourceType.PRODUCT:
                if (isAgisFetcher(fetcher)) return new AgisProductFetcher(setting, fetcher)
                throw new NotImplemented('product.fetcher')
            default:
                throw new NotImplemented('resource.type.fetcher')
        }
    }
}
