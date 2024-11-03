import 'reflect-metadata'
import { config } from "dotenv";
import Koa from 'koa'
import Router from '@koa/router'
import { schedule } from 'node-cron'
import { resourceBootstrap } from "./modules/resource/infra/bootstraps/resource-bootstrap";
import bodyParser from "koa-bodyparser";

type Route = (router: Router) => Promise<void>
async function run(): Promise<void> {
    config()

    await Promise.all([
        resourceBootstrap(),
    ])

    const router = new Router()
    const toRegister = async (route: Route) => await route(router)
    const routes = []
    await Promise.all(routes.map(toRegister))

    const app = new Koa()
    app.use(bodyParser())
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(4001, () => console.log('Running on 4001'))

    // schedule('* * * * *', importerJob)
}

run()