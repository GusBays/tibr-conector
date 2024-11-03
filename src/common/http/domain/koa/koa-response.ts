import { Context } from 'koa'
import { ResponseError, ResponseStatus } from '../response'
import { Json } from '../../../contracts/domain/contracts'

export class KoaResponse {
    private static response(ctx: Context, status: ResponseStatus, body?: Json): void {
        Object.assign(ctx, { status, body })
    }

    static success(ctx: Context, body?: Json): void {
        this.response(ctx, ResponseStatus.HTTP_OK, body)
    }

    static created(ctx: Context, body?: Json): void {
        this.response(ctx, ResponseStatus.HTTP_CREATED, body)
    }

    static noContent(ctx: Context): void {
        this.response(ctx, ResponseStatus.HTTP_NO_CONTENT)
    }

    static badRequest(ctx: Context, body: ResponseError): void {
        this.response(ctx, ResponseStatus.HTTP_BAD_REQUEST, body)
    }

    static unauthorized(ctx: Context, body: ResponseError): void {
        this.response(ctx, ResponseStatus.HTTP_UNAUTHORIZED, body)
    }

    static notFound(ctx: Context, body: ResponseError): void {
        this.response(ctx, ResponseStatus.HTTP_NOT_FOUND, body)
    }

    static unprocessableEntity(ctx: Context, body: ResponseError): void {
        this.response(ctx, ResponseStatus.HTTP_UNPROCESSABLE_ENTITY, body)
    }

    static internalServerError(ctx: Context, body: ResponseError): void {
        this.response(ctx, ResponseStatus.HTTP_INTERNAL_SERVER_ERROR, body)
    }
}
