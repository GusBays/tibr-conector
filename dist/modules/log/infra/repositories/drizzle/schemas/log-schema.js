"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const log_1 = require("../../../../domain/log");
const package_schema_1 = require("../../../../../package/infra/repositories/drizzle/schemas/package-schema");
exports.logSchema = (0, mysql_core_1.mysqlTable)(log_1.LogTypeEnum.TABLE, {
    id: (0, mysql_core_1.int)('id', { unsigned: true }).primaryKey().$type(),
    package_id: (0, mysql_core_1.int)('package_id', { unsigned: true }).references(() => package_schema_1.packageSchema.id).notNull().$type(),
    message: (0, mysql_core_1.text)('message').notNull().$type(),
    created_at: (0, mysql_core_1.timestamp)('created_at', { mode: 'string' }).notNull().defaultNow().$type(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow().$type()
});
//# sourceMappingURL=log-schema.js.map