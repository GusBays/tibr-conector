import { Context } from 'koa'
import { not } from '../../../helpers/helper'

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

        const parseArray = (key: string) => {
            if (not(key.includes('[]'))) return

            const keyParsed = key.replace('[]', '')
            const value = query[key]
            delete query[key]
            query[keyParsed] = value
        }
        Object.keys(query).forEach(parseArray)

        return { ...params, ...query } as T
    }

    static extractTempFilePath(ctx: Context): string {
        const file = ctx.request.files?.file as Record<string, any>
        return file.filepath
    }
}
