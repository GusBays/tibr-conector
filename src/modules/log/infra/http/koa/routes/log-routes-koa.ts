import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { LogFilter } from '../../../../domain/log'
import { LogService } from '../../../../domain/log-service'

const path = '/logs'

export async function logRoutesKoa(router: Router): Promise<void> {
    const { index } = logHandler()

    router.get(path, index)
}

function logHandler() {
    const service = LogService.getInstance()

    const index = async (ctx: Context): Promise<void> => {
        const logs = await service.getPaginate(KoaHelper.extractParams<LogFilter>(ctx))
        KoaResponse.success(ctx, logs)
    }

    return { index }
}
