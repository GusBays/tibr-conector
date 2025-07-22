import cors from '@koa/cors'
import { createNamespace } from 'cls-hooked'
import { format, subDays } from 'date-fns'
import 'dotenv/config'
import Koa, { Context } from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { schedule } from 'node-cron'
import 'reflect-metadata'
import { sequelizeBootstrap } from './common/db/infra/bootstraps/sequelize-bootstrap'
import { errorHandler } from './common/http/domain/koa/middlewares/error-handler-koa'
import { notificationRoutesKoa } from './common/notification/infra/http/koa/notification-routes-koa'
import { FetcherStrategyFactory } from './modules/fetcher/domain/strategies/fetcher.strategy.factory'
import { fetcherBootstrap } from './modules/fetcher/infra/bootstraps/fetcher.bootstrap'
import { fetcherRoutesKoa } from './modules/fetcher/infra/http/koa/routes/fetcher-routes-koa'
import { historyBootstrap } from './modules/history/infra/bootstraps/history-bootstrap'
import { historyRoutesKoa } from './modules/history/infra/http/koa/routes/history-routes-koa'
import { ImporterStrategyFactory } from './modules/importer/domain/strategies/importer.strategy.factory'
import { importerBootstrap } from './modules/importer/infra/bootstraps/importer.bootstrap'
import { importerRoutesKoa } from './modules/importer/infra/http/koa/routes/importer.routes.koa'
import { LogService } from './modules/log/domain/log-service'
import { logBootstrap } from './modules/log/infra/bootstraps/log-bootstrap'
import { logRoutesKoa } from './modules/log/infra/http/koa/routes/log-routes-koa'
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

process.env.TZ = 'America/Sao_Paulo'

type Route = (router: Router) => Promise<void>
async function run(): Promise<void> {
    const namespace = createNamespace('tibr-connector')

    await Promise.all([
        connectionBootstrap(),
        fetcherBootstrap(),
        historyBootstrap(),
        importerBootstrap(),
        logBootstrap(),
        resourceBootstrap(),
        settingBootstrap(),
        sequelizeBootstrap(),
        userBootstrap()
    ])

    const router = new Router().get('/health-check', (ctx: Context) => {
        ctx.body = { status: 'healthy' }
    })

    const toRegister = async (route: Route) => await route(router)
    const routes = [
        importerRoutesKoa,
        fetcherRoutesKoa,
        historyRoutesKoa,
        logRoutesKoa,
        resourceRoutesKoa,
        settingRoutesKoa,
        userRoutesKoa,
        notificationRoutesKoa
    ]
    await Promise.all(routes.map(toRegister))

    const port = process.env.APP_PORT

    const app = new Koa()
    app.use(cors())
        .use(bodyParser())
        .use(async (ctx, next) => await namespace.runAndReturn(next))
        .use(errorHandler)
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(port, () => console.log(`Running on ${port}`))

    const fetchProductsJob = async (): Promise<void> => {
        const setting = await SettingService.getInstance().getOne({})

        const byFetcher = (connection: Connection) => isFetcher(connection) && connection.active
        const toFetch = (fetcher: FetcherConnection) =>
            FetcherStrategyFactory.getInstance(ResourceType.PRODUCT, setting, fetcher).fetch()
        await Promise.all(setting.connections.filter(byFetcher).map(toFetch))
    }
    schedule('0 0 * * *', fetchProductsJob)

    const syncImportedProductsJob = async (): Promise<void> => {
        const setting = await SettingService.getInstance().getOne({})

        const byImporter = (connection: Connection) => isImporter(connection) && connection.active
        const toImport = (importer: ImporterConnection) =>
            ImporterStrategyFactory.getInstance(ResourceType.PRODUCT, setting, importer).import()
        await Promise.all(setting.connections.filter(byImporter).map(toImport))
    }
    schedule('0 2 * * *', syncImportedProductsJob)

    const clearLogsJob = async (): Promise<void> => {
        const now = new Date()
        const lastWeek = subDays(now, 7)
        const created_before = format(lastWeek, 'yyyy-MM-dd HH:mm:ss')
        await LogService.getInstance().delete({ created_before })
    }
    schedule('0 4 * * *', clearLogsJob)
}

run()
