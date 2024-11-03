"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const config_1 = require("../../../config/config");
const path_1 = require("path");
const drizzle_kit_1 = require("drizzle-kit");
(0, dotenv_1.config)();
const env = config_1.Config.get().mysql;
const modules = ['category', 'log', 'package', 'product', 'store-package'];
const subModules = [
    'product/product-image'
];
const toGetModuleSchema = (module) => (0, path_1.resolve)('src', 'modules', module, 'infra', 'repositories', 'drizzle', 'schemas', `${module}-schema.ts`);
const toSplitSubModule = (module) => module.split('/');
const toGetSubModuleSchema = ([module, subModule]) => (0, path_1.resolve)('src', 'modules', module, 'infra', 'repositories', 'drizzle', 'schemas', `${subModule}-schema.ts`);
const schemas = [...modules.map(toGetModuleSchema), ...subModules.map(toSplitSubModule).map(toGetSubModuleSchema)];
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: schemas,
    dialect: 'mysql',
    out: (0, path_1.relative)(process.cwd(), 'src/common/db/drizzle/infra/migrations'),
    dbCredentials: {
        host: env.host,
        user: env.user,
        password: env.password,
        database: env.database
    }
});
//# sourceMappingURL=drizzle-config.js.map