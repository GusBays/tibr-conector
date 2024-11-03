"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const product_1 = require("../../../../domain/product");
const package_schema_1 = require("../../../../../package/infra/repositories/drizzle/schemas/package-schema");
exports.productSchema = (0, mysql_core_1.mysqlTable)(product_1.ProductTypeEnum.TABLE, {
    id: (0, mysql_core_1.int)('id', { unsigned: true }).primaryKey().$type(),
    package_id: (0, mysql_core_1.int)('package_id', { unsigned: true }).references(() => package_schema_1.packageSchema.id).notNull().$type(),
    source_id: (0, mysql_core_1.int)('source_id').references(() => package_schema_1.packageSchema.id).notNull().$type(),
    source_register_id: (0, mysql_core_1.varchar)('source_register_id', { length: 255 }).notNull().$type(),
    target_id: (0, mysql_core_1.int)('target_id').references(() => package_schema_1.packageSchema.id).notNull().$type(),
    target_register_id: (0, mysql_core_1.varchar)('target_register_id', { length: 255 }).notNull().$type(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull().$type(),
    description: (0, mysql_core_1.text)('description').$type(),
    markup: (0, mysql_core_1.decimal)('markup', { precision: 8, scale: 2 }).$type(),
    price: (0, mysql_core_1.decimal)('price', { precision: 8, scale: 2 }).$type(),
    weight: (0, mysql_core_1.decimal)('weight', { precision: 8, scale: 2 }).$type(),
    height: (0, mysql_core_1.decimal)('height', { precision: 8, scale: 2 }).$type(),
    width: (0, mysql_core_1.decimal)('width', { precision: 8, scale: 2 }).$type(),
    depth: (0, mysql_core_1.decimal)('depth', { precision: 8, scale: 2 }).$type(),
    balance: (0, mysql_core_1.int)('balance').$type(),
    reference: (0, mysql_core_1.varchar)('reference', { length: 255 }).notNull().$type(),
    gtin: (0, mysql_core_1.int)('gtin', { unsigned: true }).notNull().$type(),
    ncm: (0, mysql_core_1.int)('ncm', { unsigned: true }).notNull().$type(),
    partial_update: (0, mysql_core_1.boolean)('partial_update').notNull().default(false).$type(),
    complete_update: (0, mysql_core_1.boolean)('complete_update').notNull().default(false).$type(),
    created_at: (0, mysql_core_1.timestamp)('created_at', { mode: 'string' }).notNull().defaultNow().$type(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow().$type()
});
//# sourceMappingURL=product-schema.js.map