"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageSchema = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const product_image_1 = require("../../../../domain/product-image/product-image");
const product_schema_1 = require("./product-schema");
exports.productImageSchema = (0, mysql_core_1.mysqlTable)(product_image_1.ProductImageTypeEnum.TABLE, {
    id: (0, mysql_core_1.int)('id', { unsigned: true }).primaryKey().$type(),
    product_id: (0, mysql_core_1.int)('product_id', { unsigned: true }).references(() => product_schema_1.productSchema.id).notNull().$type(),
    src: (0, mysql_core_1.varchar)('src', { length: 512 }).notNull().$type(),
    position: (0, mysql_core_1.int)('position', { unsigned: true }).$type(),
    created_at: (0, mysql_core_1.timestamp)('created_at', { mode: 'string' }).notNull().defaultNow().$type(),
    updated_at: (0, mysql_core_1.timestamp)('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow().$type()
});
//# sourceMappingURL=product-image-schema.js.map