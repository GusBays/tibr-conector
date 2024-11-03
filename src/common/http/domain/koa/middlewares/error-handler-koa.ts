import { Context, Next } from 'koa'
import { NotFound } from '../../../../exceptions/not-found'
import { Unauthenticated } from '../../../../exceptions/unauthenticated'
import { UnprocessableEntity } from '../../../../exceptions/unprocessable-entity'
import { isNotEmpty } from '../../../../helpers/helper'
import { KoaResponse } from '../koa-response'

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
    try {
        await next()
    } catch (e) {
        handle(e, ctx)
    }
}

function handle(e: Error, ctx: Context): void {
    const body = {
        code: e.name,
        message: e.message
    }

    KoaResponse.internalServerError(ctx, body)

    if (e instanceof Unauthenticated) KoaResponse.unauthorized(ctx, body)

    if (e instanceof NotFound) KoaResponse.notFound(ctx, body)

    if (e instanceof UnprocessableEntity) {
        if (e.causes) {
            Object.assign(body, e.causes)
        }
        KoaResponse.unprocessableEntity(ctx, body)
    }

    if (e instanceof TypeError) {
        const causes = e.stack
            ?.replace('TypeError: ' + e.message, '')
            .split('at ')
            .map(message => message.trim().replace('\n', ''))
            .filter(message => isNotEmpty(message) && '' !== message)
            .map(message => 'at ' + message)
        Object.assign(body, { causes })
        KoaResponse.internalServerError(ctx, body)
    }
}
