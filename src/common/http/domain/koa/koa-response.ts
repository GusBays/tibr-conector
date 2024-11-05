import { Context } from 'koa'

export class KoaResponse {
    private static response(ctx: Context, status: number, body?: Record<string, any>): void {
        Object.assign(ctx, { status, body })
    }

    static success(ctx: Context, body?: Record<string, any>): void {
        this.response(ctx, 200, body)
    }

    static created(ctx: Context, body?: Record<string, any>): void {
        this.response(ctx, 201, body)
    }

    static noContent(ctx: Context): void {
        this.response(ctx, 204)
    }

    static badRequest(ctx: Context, body: Record<string, any>): void {
        this.response(ctx, 400, body)
    }

    static unauthorized(ctx: Context, body: Record<string, any>): void {
        this.response(ctx, 401, body)
    }

    static notFound(ctx: Context, body: Record<string, any>): void {
        this.response(ctx, 404, body)
    }

    static unprocessableEntity(ctx: Context, body: Record<string, any>): void {
        this.response(ctx, 422, body)
    }

    static internalServerError(ctx: Context, body: Record<string, any>): void {
        this.response(ctx, 500, body)
    }
}
