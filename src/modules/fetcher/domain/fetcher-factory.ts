import { NotImplemented } from '../../../common/exceptions/not-implemented'
import { FetcherSetting } from '../../setting/domain/setting'
import { AgisFetcher } from './agis-fetcher'
import { Fetcher } from './fetcher'
import { isAgisFetcher } from './fetcher-helper'

export class FetcherFactory {
    static getInstance(setting: FetcherSetting): Fetcher {
        if (isAgisFetcher(setting)) return new AgisFetcher(setting)
        throw new NotImplemented('fetcher')
    }
}
