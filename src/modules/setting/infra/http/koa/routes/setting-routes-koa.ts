import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { Setting, SettingFilter } from '../../../../domain/setting'
import { SettingService } from '../../../../domain/setting-service'

const path = '/settings'

export async function settingRoutesKoa(router: Router): Promise<void> {
    const { store, show, update } = settingHandler()

    router.post(path, auth, store)
    router.get(path, auth, show)
    router.put(`${path}/:id`, auth, update)
}

function settingHandler() {
    const service = SettingService.getInstance()

    const store = async (ctx: Context): Promise<void> => {
        const setting = await service.create(KoaHelper.extractBody<Setting>(ctx))
        KoaResponse.success(ctx, setting)
    }

    const show = async (ctx: Context): Promise<void> => {
        const setting = await service.getOne(KoaHelper.extractParams<SettingFilter>(ctx))
        KoaResponse.success(ctx, setting)
    }

    const update = async (ctx: Context): Promise<void> => {
        const setting = await service.update(KoaHelper.extractBody<Setting>(ctx))
        KoaResponse.success(ctx, setting)
    }

    return { store, show, update }
}
