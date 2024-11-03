"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const package_schema_1 = require("../../../../../package/infra/repositories/drizzle/schemas/package-schema");
exports.categorySchema = (0, mysql_core_1.mysqlTable)('categories', {
    id: (0, mysql_core_1.int)('id', { unsigned: true }).primaryKey().$type(),
    source_id: (0, mysql_core_1.int)('source_id', { unsigned: true }).references(() => package_schema_1.packageSchema.id).notNull().$type(),
    source_register_id: (0, mysql_core_1.varchar)('source_register_id', { length: 255 }).notNull().$type(),
    target_id: (0, mysql_core_1.int)('target_id', { unsigned: true }).references(() => package_schema_1.packageSchema.id).notNull().$type(),
    target_register_id: (0, mysql_core_1.varchar)('target_register_id', { length: 255 }).notNull().$type(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull().$type(),
    parent_id: (0, mysql_core_1.int)('parent_id', { unsigned: true }).references(() => exports.categorySchema.id).$type(),
    created_at: (0, mysql_core_1.timestamp)('created_at', { mode: 'string' }).notNull().defaultNow().$type(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow().$type()
});
//# sourceMappingURL=category-schema.js.map