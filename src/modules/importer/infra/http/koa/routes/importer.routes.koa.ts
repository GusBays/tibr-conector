import { Context } from 'koa'
import Router from 'koa-router'
import { KoaHelper } from '../../../../../../common/http/domain/koa/koa-helper'
import { KoaResponse } from '../../../../../../common/http/domain/koa/koa-response'
import { ConnectionFilter } from '../../../../../setting/domain/connection/connection'
import { ImporterService } from '../../../../domain/importer.service'

const path = '/importers'

export async function importerRoutesKoa(router: Router): Promise<void> {
    const { importer } = importerHandler()

    router.post(`${path}/:id/import/:resource`, importer)
}

function importerHandler() {
    const service = ImporterService.getInstance()

    const importer = async (ctx: Context): Promise<void> => {
        const { id, resource } = KoaHelper.extractParams<ConnectionFilter>(ctx)
        await service.import(id, resource)
        KoaResponse.success(ctx, { success: true })
    }

    return { importer }
}
