import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { Resource, ResourceFilter } from '../../../../domain/resource'
import { ResourceService } from '../../../../domain/resource-service'

const path = '/resources'

export async function resourceRoutesKoa(router: Router): Promise<void> {
    const { index, show, update } = resourceHandler()

    router.get(path, index)
    router.get(`${path}/:id`, show)
    router.put(`${path}/:id`, update)
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
