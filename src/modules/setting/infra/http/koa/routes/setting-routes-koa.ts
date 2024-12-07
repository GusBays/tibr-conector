import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { Setting, SettingFilter } from '../../../../domain/setting'
import { SettingService } from '../../../../domain/setting-service'

const path = '/settings'

export async function settingRoutesKoa(router: Router): Promise<void> {
    const { storeOrUpdate, show, syncPricingGroups, syncWebhooks, getCategories } = settingHandler()

    router.post(path, auth, storeOrUpdate)
    router.get(path, auth, show)
    router.post(`${path}/:id/sync-price-groups`, auth, syncPricingGroups)
    router.post(`${path}/:id/sync-webhooks`, auth, syncWebhooks)
    router.get(`${path}/:id/categories`, auth, getCategories)
}

function settingHandler() {
    const service = SettingService.getInstance()

    const storeOrUpdate = async (ctx: Context): Promise<void> => {
        const setting = await service.createOrUpdate(KoaHelper.extractBody<Setting>(ctx))
        KoaResponse.success(ctx, setting)
    }

    const show = async (ctx: Context): Promise<void> => {
        const setting = await service.getOne(KoaHelper.extractParams<SettingFilter>(ctx))
        KoaResponse.success(ctx, setting)
    }

    const syncPricingGroups = async (ctx: Context): Promise<void> => {
        const setting = await service.syncPricingGroups(KoaHelper.extractParams<SettingFilter>(ctx))
        KoaResponse.success(ctx, setting)
    }

    const syncWebhooks = async (ctx: Context): Promise<void> => {
        await service.syncWebhooks(KoaHelper.extractParams<SettingFilter>(ctx))
        KoaResponse.noContent(ctx)
    }

    const getCategories = async (ctx: Context): Promise<void> => {
        const categories = await service.getCategories(KoaHelper.extractParams<SettingFilter>(ctx))
        KoaResponse.success(ctx, categories)
    }

    return { storeOrUpdate, show, syncPricingGroups, syncWebhooks, getCategories }
}
