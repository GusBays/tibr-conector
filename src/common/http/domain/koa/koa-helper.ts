import { Context } from 'koa'

export abstract class KoaHelper {
    static extractBody<T = any>(ctx: Context): T {
        const body: Record<string, any> = ctx.request.body || {}

        if ('PUT' === ctx.method) {
            const id = ctx.params?.id
            Object.assign(body, { id })
        }

        return body as T
    }

    static extractParams<T = any>(ctx: Context): T {
        const params = ctx.params || {}
        const query = ctx.query || {}
        return { ...params, ...query } as T
    }
}
