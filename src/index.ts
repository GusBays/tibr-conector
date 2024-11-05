import Router from '@koa/router'
import { createNamespace } from 'cls-hooked'
import { config } from 'dotenv'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { schedule } from 'node-cron'
import 'reflect-metadata'
import { sequelizeBootstrap } from './common/db/infra/bootstraps/sequelize-bootstrap'
import { FetcherFactory } from './modules/fetcher/domain/fetcher-factory'
import { historyBootstrap } from './modules/history/infra/bootstraps/history-bootstrap'
import { historyRoutesKoa } from './modules/history/infra/http/koa/routes/history-routes-koa'
import { ImporterFactory } from './modules/importer/domain/importer-factory'
import { ResourceType } from './modules/resource/domain/resource'
import { resourceBootstrap } from './modules/resource/infra/bootstraps/resource-bootstrap'
import { resourceRoutesKoa } from './modules/resource/infra/http/koa/routes/resource-routes-koa'
import { Connection, FetcherConnection, ImporterConnection } from './modules/setting/domain/connection/connection'
import { isFetcher, isImporter } from './modules/setting/domain/connection/connection-helper'
import { SettingService } from './modules/setting/domain/setting-service'
import { connectionBootstrap } from './modules/setting/infra/bootstraps/connection-bootstrap'
import { settingBootstrap } from './modules/setting/infra/bootstraps/setting-bootstrap'
import { settingRoutesKoa } from './modules/setting/infra/http/koa/routes/setting-routes-koa'
import { userBootstrap } from './modules/user/infra/bootstraps/user-bootstrap'
import { userRoutesKoa } from './modules/user/infra/http/koa/routes/user-routes-koa'

type Route = (router: Router) => Promise<void>
async function run(): Promise<void> {
    config()
    const namespace = createNamespace('tibr-connector')

    await Promise.all([
        connectionBootstrap(),
        historyBootstrap(),
        resourceBootstrap(),
        settingBootstrap(),
        sequelizeBootstrap(),
        userBootstrap()
    ])

    const router = new Router()
    const toRegister = async (route: Route) => await route(router)
    const routes = [historyRoutesKoa, resourceRoutesKoa, settingRoutesKoa, userRoutesKoa]
    await Promise.all(routes.map(toRegister))

    const app = new Koa()
    app.use(bodyParser())
        .use(async (ctx, next) => await namespace.runAndReturn(async () => await next()))
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(4001, () => console.log('Running on 4001'))

    const fetchProductsJob = async (): Promise<void> => {
        const setting = await SettingService.getInstance().getOne({})

        const byFetcher = (connection: Connection) => isFetcher(connection)
        const toFetch = async (fetcher: FetcherConnection) =>
            await FetcherFactory.getInstance(ResourceType.PRODUCT, setting, fetcher).fetch()
        await Promise.all(setting.connections.filter(byFetcher).map(toFetch))
    }
    schedule('0 0 * * *', fetchProductsJob)

    const importProductsJob = async (): Promise<void> => {
        const setting = await SettingService.getInstance().getOne({})

        const byImporter = (connection: Connection) => isImporter(connection)
        const toImport = async (importer: ImporterConnection) =>
            await ImporterFactory.getInstance(ResourceType.PRODUCT, setting, importer).import()
        await Promise.all(setting.connections.filter(byImporter).map(toImport))
    }
    schedule('0 2 * * *', importProductsJob)
}

run()
