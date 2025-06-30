import { Context } from 'koa'
import Router from 'koa-router'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { ConnectionFilter } from '../../../../../setting/domain/connection/connection'
import { FetcherService } from '../../../../domain/fetcher.service'

const path = '/fetchers'

export async function fetcherRoutesKoa(router: Router): Promise<void> {
    const { fetch } = fetcherHandler()

    router.post(`${path}/:id/fetch/:resource`, fetch)
}

function fetcherHandler() {
    const service = FetcherService.getInstance()

    const fetch = async (ctx: Context): Promise<void> => {
        const { id, resource } = KoaHelper.extractParams<ConnectionFilter>(ctx)
        await service.fetch(id, resource)
        KoaResponse.success(ctx, { success: true })
    }

    return { fetch }
}
