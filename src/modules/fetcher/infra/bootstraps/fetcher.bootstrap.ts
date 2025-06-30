import { container } from 'tsyringe'
import { FetcherTypeEnum } from '../../domain/fetcher'
import { FetcherService } from '../../domain/fetcher.service'

export async function fetcherBootstrap(): Promise<void> {
    container.register(FetcherTypeEnum.SERVICE, FetcherService)
}
