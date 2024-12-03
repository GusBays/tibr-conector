import { Router } from '@koa/router'
import { Context } from 'koa'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { auth } from '../../../../../../common/http/domain/koa/middlewares/auth-koa'
import { User, UserFilter } from '../../../../domain/user'
import { UserService } from '../../../../domain/user-service'

const path = '/users'

export async function userRoutesKoa(router: Router): Promise<void> {
    const { store, index, show, update, destroy, login } = userHandler()

    router.post(path, store)
    router.get(path, auth, index)
    router.get(`${path}/:id`, auth, show)
    router.put(`${path}/:id`, auth, update)
    router.delete(`${path}/:id`, auth, destroy)
    router.post(`${path}/login`, login)
}

function userHandler() {
    const service = UserService.getInstance()

    const store = async (ctx: Context): Promise<void> => {
        const user = await service.create(KoaHelper.extractBody<User>(ctx))
        KoaResponse.created(ctx, user)
    }

    const index = async (ctx: Context): Promise<void> => {
        const users = await service.getPaginate(KoaHelper.extractParams<UserFilter>(ctx))
        KoaResponse.success(ctx, users)
    }

    const show = async (ctx: Context): Promise<void> => {
        const { id } = KoaHelper.extractParams<UserFilter>(ctx)

        const filter = isNaN(+id) ? { token: id } : { id: Number(id) }

        const user = await service.getOne(filter)
        KoaResponse.success(ctx, user)
    }

    const update = async (ctx: Context): Promise<void> => {
        const user = await service.update(KoaHelper.extractBody<User>(ctx))
        KoaResponse.success(ctx, user)
    }

    const destroy = async (ctx: Context): Promise<void> => {
        await service.delete({ id: Number(ctx.params.id) })
        KoaResponse.noContent(ctx)
    }

    const login = async (ctx: Context): Promise<void> => {
        const user = await service.login(KoaHelper.extractBody<{ email: string; password: string }>(ctx))
        KoaResponse.success(ctx, user)
    }

    return { store, index, show, update, destroy, login }
}
