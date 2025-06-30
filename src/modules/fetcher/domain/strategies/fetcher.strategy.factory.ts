import { NotImplemented } from '../../../../common/exceptions/not-implemented'
import { ResourceType } from '../../../resource/domain/resource'
import { FetcherConnection } from '../../../setting/domain/connection/connection'
import { Setting } from '../../../setting/domain/setting'
import { isAgisFetcher } from '../fetcher-helper'
import { AgisProductFetcherStrategy } from './agis-product-fetcher.strategy'
import { FetcherStrategy } from './fetcher.strategy'

export class FetcherStrategyFactory {
    static getInstance(type: ResourceType, setting: Setting, fetcher: FetcherConnection): FetcherStrategy {
        switch (type) {
            case ResourceType.PRODUCT:
                if (isAgisFetcher(fetcher)) return new AgisProductFetcherStrategy(setting, fetcher)
                throw new NotImplemented('product.fetcher')
            default:
                throw new NotImplemented('resource.type.fetcher')
        }
    }
}
