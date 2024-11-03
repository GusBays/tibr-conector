"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageSchemaRelations = exports.packageSchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const package_1 = require("../../../../domain/package");
const store_package_schema_1 = require("../../../../../store-package/infra/repositories/drizzle/schemas/store-package-schema");
const drizzle_orm_1 = require("drizzle-orm");
const package_target_schema_1 = require("./package-target-schema");
exports.packageSchema = (0, mysql_core_1.mysqlTable)(package_1.PackageTypeEnum.TABLE, {
    id: (0, mysql_core_1.int)('id', { unsigned: true }).primaryKey().$type(),
    store_package_id: (0, mysql_core_1.int)('store_package_id', { unsigned: true }).notNull().references(() => store_package_schema_1.storePackageSchema.id),
    settings: (0, mysql_core_1.json)('settings').notNull().$type(),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull().$type(),
    last_sync: (0, mysql_core_1.timestamp)('last_sync', { mode: 'string' }).$type(),
    created_at: (0, mysql_core_1.timestamp)('created_at', { mode: 'string' }).notNull().defaultNow().$type(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow().$type()
});
exports.packageSchemaRelations = (0, drizzle_orm_1.relations)(exports.packageSchema, ({ many }) => ({
    targets: many(package_target_schema_1.packageTargetSchema)
}));
//# sourceMappingURL=package-schema.js.map