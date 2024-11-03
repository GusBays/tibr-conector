"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const node_cron_1 = require("node-cron");
const drizzle_bootstrap_1 = require("./common/db/drizzle/bootstrap/drizzle-bootstrap");
const store_package_bootstrap_1 = require("./modules/store-package/bootstraps/store-package-bootstrap");
const package_bootstrap_1 = require("./modules/package/infra/boostraps/package-bootstrap");
const product_bootstrap_1 = require("./modules/product/infra/bootstraps/product-bootstrap");
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const store_package_routes_koa_1 = require("./modules/store-package/infra/http/koa/routes/store-package-routes-koa");
const package_routes_koa_1 = require("./modules/package/infra/http/koa/routes/package-routes-koa");
const log_bootstrap_1 = require("./modules/log/infra/bootstraps/log-bootstrap");
const category_bootstrap_1 = require("./modules/category/infra/bootstraps/category-bootstrap");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, dotenv_1.config)();
        yield Promise.all([
            (0, drizzle_bootstrap_1.drizzleBootstrap)(),
            (0, store_package_bootstrap_1.storePackageBootstrap)(),
            (0, package_bootstrap_1.packageBootstrap)(),
            (0, product_bootstrap_1.productBootstrap)(),
            (0, category_bootstrap_1.categoryBootstrap)(),
            (0, log_bootstrap_1.logBootstrap)()
        ]);
        const router = new router_1.default();
        const toRegister = (route) => __awaiter(this, void 0, void 0, function* () { return yield route(router); });
        const routes = [store_package_routes_koa_1.storePackageRoutesKoa, package_routes_koa_1.packageRoutesKoa];
        yield Promise.all(routes.map(toRegister));
        const app = new koa_1.default();
        app.use((0, koa_bodyparser_1.default)())
            .use(router.routes())
            .use(router.allowedMethods())
            .listen(4001, () => console.log('Running on 4001'));
        (0, node_cron_1.schedule)('* * * * *', () => console.log('Running every minute'));
    });
}
run();
//# sourceMappingURL=index.js.map