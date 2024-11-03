"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageTargetSchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const package_schema_1 = require("./package-schema");
const package_target_1 = require("../../../../domain/package-target/package-target");
exports.packageTargetSchema = (0, mysql_core_1.mysqlTable)(package_target_1.PackageTargetTypeEnum.TABLE, {
    package_id: (0, mysql_core_1.int)('package_id', { unsigned: true }).references(() => package_schema_1.packageSchema.id).notNull().$type(),
    target_id: (0, mysql_core_1.int)('target_id', { unsigned: true }).notNull().references(() => package_schema_1.packageSchema.id).$type(),
});
//# sourceMappingURL=package-target-schema.js.map