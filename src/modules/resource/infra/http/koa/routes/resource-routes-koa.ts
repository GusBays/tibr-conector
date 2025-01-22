import { Router } from '@koa/router'
import { UUID } from 'crypto'
import { Context } from 'koa'
import koaBody from 'koa-body'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { BagyWebhookPayload } from '../../../../../bagy/domain/bagy-webhook'
import { ConnectionApi } from '../../../../../setting/domain/connection/connection'
import { Resource, ResourceFilter } from '../../../../domain/resource'
import { ResourceService } from '../../../../domain/resource-service'

const path = '/resources'

export async function resourceRoutesKoa(router: Router): Promise<void> {
    const { index, show, update, sync, getImage, createImage, deleteImage, webhook } = resourceHandler()

    router.get(path, auth, index)
    router.get(`${path}/:id`, auth, show)
    router.put(`${path}/:id`, auth, update)
    router.post(`${path}/:id/sync`, auth, sync)
    router.post(
        `${path}/:id/images`,
        auth,
        koaBody({
            multipart: true
        }),
        createImage
    )
    router.delete(`${path}/:id/images/:image_id`, deleteImage)
    router.post(`${path}/:api/webhook`, webhook)

    // open route
    router.get(`${path}/:type/images/:image_id`, getImage)
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
        const filter = KoaHelper.extractParams<ResourceFilter & { image_id: `${UUID}.${string}` }>(ctx)
        const image = await service.getImage(filter)

        ctx.set('Content-Type', 'image/jpeg')
        ctx.set('Content-Length', image.length.toString())

        KoaResponse.success(ctx, image)
    }

    const createImage = async (ctx: Context): Promise<void> => {
        const filter = KoaHelper.extractParams<ResourceFilter>(ctx)
        const path = KoaHelper.extractTempFilePath(ctx)

        const body = await service.createImage(filter, path)
        KoaResponse.created(ctx, body)
    }

    const deleteImage = async (ctx: Context): Promise<void> => {
        const filter = KoaHelper.extractParams<ResourceFilter & { image_id: `${UUID}.${string}` }>(ctx)
        const body = await service.deleteImage(filter)
        return KoaResponse.success(ctx, body)
    }

    const webhook = async (ctx: Context): Promise<void> => {
        const { api } = KoaHelper.extractParams<{ api: string }>(ctx)
        const body = KoaHelper.extractBody<BagyWebhookPayload>(ctx)
        await service.webhook(api as ConnectionApi, body)
    }

    return { index, show, update, sync, getImage, createImage, deleteImage, webhook }
}
