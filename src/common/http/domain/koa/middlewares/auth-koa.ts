import { verify } from 'jsonwebtoken'
import { Context, Next } from 'koa'
import { UserType } from '../../../../../modules/user/domain/user'
import { UserService } from '../../../../../modules/user/domain/user-service'
import { Unauthenticated } from '../../../../exceptions/unauthenticated'
import { isEmpty, throwIf } from '../../../../helpers/helper'

export async function auth(ctx: Context, next: Next): Promise<void> {
    const auth = ctx.header.authorization
    const token = auth?.split(' ').at(1)

    const missingToken = isEmpty(auth) || isEmpty(token)
    throwIf(missingToken, Unauthenticated)

    const key = process.env.APP_KEY

    try {
        const authorization = verify(token, key) as Record<string, any>

        if (UserType.SUPER === authorization.type) return next()

        const user = await UserService.getInstance().getOne({ email: authorization.email, type: authorization.type })
        Object.assign(ctx, { user })
    } catch (e) {
        throw new Unauthenticated()
    }

    await next()
}
