"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storePackageSchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const store_package_1 = require("../../../../domain/store-package");
exports.storePackageSchema = (0, mysql_core_1.mysqlTable)(store_package_1.StorePackageTypeEnum.TABLE, {
    id: (0, mysql_core_1.int)('id', { unsigned: true }).primaryKey().$type(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull().$type(),
    slug: (0, mysql_core_1.varchar)('slug', { length: 255 }).notNull().unique().$type(),
    image: (0, mysql_core_1.varchar)('image', { length: 512 }).$type(),
    created_at: (0, mysql_core_1.timestamp)('created_at', { mode: 'string' }).notNull().defaultNow().$type(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow().$type()
});
//# sourceMappingURL=store-package-schema.js.map