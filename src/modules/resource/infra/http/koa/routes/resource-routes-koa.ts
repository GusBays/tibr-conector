import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { Resource, ResourceFilter } from '../../../../domain/resource'
import { ResourceService } from '../../../../domain/resource-service'

const path = '/resources'

export async function resourceRoutesKoa(router: Router): Promise<void> {
    const { index, show, update } = resourceHandler()

    router.get(path, auth, index)
    router.get(`${path}/:id`, auth, show)
    router.put(`${path}/:id`, auth, update)
}

function resourceHandler() {
    const service = ResourceService.getInstance()

    const index = async (ctx: Context): Promise<void> => {
        const resource = await service.getPaginate(KoaHelper.extractParams<ResourceFilter>(ctx))
        KoaResponse.success(ctx, resource)
    }

    const show = async (ctx: Context): Promise<void> => {
        const resource = await service.getOne(KoaHelper.extractParams<ResourceFilter>(ctx))
        KoaResponse.success(ctx, resource)
    }

    const update = async (ctx: Context): Promise<void> => {
        const resource = await service.update(KoaHelper.extractBody<Resource>(ctx))
        KoaResponse.success(ctx, resource)
    }

    return { index, show, update }
}
