import { container } from 'tsyringe'
import { FetcherService } from '../../domain/fetcher-service'
import { FetcherTypeEnum } from '../../domain/fetcher-types'

export async function fetcherBootstrap(): Promise<void> {
    container.register(FetcherTypeEnum.SERVICE, FetcherService)
}
