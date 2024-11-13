import { Router } from '@koa/router'
import { UUID } from 'crypto'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { Resource, ResourceFilter } from '../../../../domain/resource'
import { ResourceService } from '../../../../domain/resource-service'

const path = '/resources'

export async function resourceRoutesKoa(router: Router): Promise<void> {
    const { index, show, update, sync, getImage } = resourceHandler()

    router.get(path, auth, index)
    router.get(`${path}/:id`, auth, show)
    router.put(`${path}/:id`, auth, update)
    router.post(`${path}/:id/sync`, auth, sync)
    router.get(`${path}/:type/images/:id/:image_id`, getImage)
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

    const sync = async (ctx: Context): Promise<void> => {
        const resource = await service.sync(KoaHelper.extractParams<ResourceFilter>(ctx))
        KoaResponse.success(ctx, resource)
    }

    const getImage = async (ctx: Context): Promise<void> => {
        const filter = KoaHelper.extractParams<ResourceFilter & { image_id: UUID }>(ctx)
        const image = await service.getImage(filter)

        ctx.set('Content-Type', 'image/jpeg')
        ctx.set('Content-Length', image.length.toString())

        KoaResponse.success(ctx, image)
    }

    return { index, show, update, sync, getImage }
}
