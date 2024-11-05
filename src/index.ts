import Router from '@koa/router'
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
import { FetcherSetting, ImporterSetting, SettingType } from './modules/setting/domain/setting'
import { SettingService } from './modules/setting/domain/setting-service'
import { settingBootstrap } from './modules/setting/infra/bootstraps/setting-bootstrap'
import { settingRoutesKoa } from './modules/setting/infra/http/koa/routes/setting-routes-koa'
import { userBootstrap } from './modules/user/infra/bootstraps/user-bootstrap'
import { userRoutesKoa } from './modules/user/infra/http/koa/routes/user-routes-koa'

type Route = (router: Router) => Promise<void>
async function run(): Promise<void> {
    config()

    await Promise.all([historyBootstrap(), resourceBootstrap(), settingBootstrap(), sequelizeBootstrap(), userBootstrap()])

    const router = new Router()
    const toRegister = async (route: Route) => await route(router)
    const routes = [historyRoutesKoa, resourceRoutesKoa, settingRoutesKoa, userRoutesKoa]
    await Promise.all(routes.map(toRegister))

    const app = new Koa()
    app.use(bodyParser())
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(4001, () => console.log('Running on 4001'))

    const fetchProductsJob = async (): Promise<void> => {
        const settings = await SettingService.getInstance().getAll({ type: SettingType.FETCHER })

        const toFetch = async (setting: FetcherSetting) =>
            await FetcherFactory.getInstance(ResourceType.PRODUCT, setting).fetch()
        await Promise.all(settings.map(toFetch))
    }
    schedule('0 0 * * *', fetchProductsJob)

    const importProductsJob = async (): Promise<void> => {
        const settings = await SettingService.getInstance().getAll({ type: SettingType.IMPORTER })

        const toImport = async (setting: ImporterSetting) =>
            await ImporterFactory.getInstance(ResourceType.PRODUCT, setting).import()
        await Promise.all(settings.map(toImport))
    }
    schedule('0 2 * * *', importProductsJob)
}

run()
