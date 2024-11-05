import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { HistoryFilter } from '../../../../domain/history'
import { HistoryService } from '../../../../domain/history-service'

const path = '/histories'

export async function historyRoutesKoa(router: Router): Promise<void> {
    const { index } = historyHandler()

    router.get(path, auth, index)
}

function historyHandler() {
    const service = HistoryService.getInstance()

    const index = async (ctx: Context): Promise<void> => {
        const histories = await service.getPaginate(KoaHelper.extractParams<HistoryFilter>(ctx))
        KoaResponse.success(ctx, histories)
    }

    return { index }
}
