import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { Setting, SettingFilter } from '../../../../domain/setting'
import { SettingService } from '../../../../domain/setting-service'

const path = '/settings'

export async function settingRoutesKoa(router: Router): Promise<void> {
    const { storeOrUpdate, getOne } = settingHandler()

    router.post(path, storeOrUpdate)
    router.get(path, getOne)
}

function settingHandler() {
    const service = SettingService.getInstance()

    const storeOrUpdate = async (ctx: Context): Promise<void> => {
        const setting = await service.createOrUpdate(KoaHelper.extractBody<Setting>(ctx))
        KoaResponse.success(ctx, setting)
    }

    const getOne = async (ctx: Context): Promise<void> => {
        const setting = await service.getOne(KoaHelper.extractParams<SettingFilter>(ctx))
        KoaResponse.success(ctx, setting)
    }

    return { storeOrUpdate, getOne }
}
