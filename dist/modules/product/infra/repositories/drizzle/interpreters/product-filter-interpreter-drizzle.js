"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFilterInterpreterDrizzle = productFilterInterpreterDrizzle;
const drizzle_orm_1 = require("drizzle-orm");
const product_schema_1 = require("../schemas/product-schema");
function productFilterInterpreterDrizzle(filter) {
    const conditions = [];
    const { id, source_id, target_id, complete_update, partial_update, q } = filter;
    if (id)
        conditions.push((0, drizzle_orm_1.eq)(product_schema_1.productSchema.id, id));
    if (source_id)
        conditions.push((0, drizzle_orm_1.eq)(product_schema_1.productSchema.source_id, source_id));
    if (target_id)
        conditions.push((0, drizzle_orm_1.eq)(product_schema_1.productSchema.target_id, target_id));
    if (complete_update)
        conditions.push((0, drizzle_orm_1.eq)(product_schema_1.productSchema.complete_update, complete_update));
    if (partial_update)
        conditions.push((0, drizzle_orm_1.eq)(product_schema_1.productSchema.partial_update, partial_update));
    if (q) {
        const likePattern = `%${filter.q}%`;
        conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(product_schema_1.productSchema.name, likePattern), (0, drizzle_orm_1.like)(product_schema_1.productSchema.reference, likePattern)));
    }
    return conditions.length > 1 ? (0, drizzle_orm_1.and)(...conditions) : conditions.at(0);
}
//# sourceMappingURL=product-filter-interpreter-drizzle.js.map