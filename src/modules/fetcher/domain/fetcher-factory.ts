import { NotImplemented } from '../../../common/exceptions/not-implemented'
import { ResourceType } from '../../resource/domain/resource'
import { FetcherSetting } from '../../setting/domain/setting'
import { AgisProductFetcher } from './agis-product-fetcher'
import { Fetcher } from './fetcher'
import { isAgisFetcher } from './fetcher-helper'

export class FetcherFactory {
    static getInstance(type: ResourceType, setting: FetcherSetting): Fetcher {
        switch (type) {
            case ResourceType.PRODUCT:
                if (isAgisFetcher(setting)) return new AgisProductFetcher(setting)
                throw new NotImplemented('product.fetcher')
            default:
                throw new NotImplemented('resource.type.fetcher')
        }
    }
}
