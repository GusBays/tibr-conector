"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryFilterInterpreterDrizzle = categoryFilterInterpreterDrizzle;
const drizzle_orm_1 = require("drizzle-orm");
const category_schema_1 = require("../schemas/category-schema");
function categoryFilterInterpreterDrizzle(filter) {
    const conditions = [];
    if (filter.id)
        conditions.push((0, drizzle_orm_1.eq)(category_schema_1.categorySchema.id, filter.id));
    if (filter.source_id)
        conditions.push((0, drizzle_orm_1.eq)(category_schema_1.categorySchema.source_id, filter.source_id));
    if (filter.source_register_id)
        conditions.push((0, drizzle_orm_1.eq)(category_schema_1.categorySchema.source_register_id, filter.source_register_id));
    if (filter.target_id)
        conditions.push((0, drizzle_orm_1.eq)(category_schema_1.categorySchema.target_id, filter.target_id));
    if (filter.target_register_id)
        conditions.push((0, drizzle_orm_1.eq)(category_schema_1.categorySchema.target_register_id, filter.target_register_id));
    if (filter.parent_id)
        conditions.push((0, drizzle_orm_1.eq)(category_schema_1.categorySchema.parent_id, filter.parent_id));
    return conditions.length > 1 ? (0, drizzle_orm_1.and)(...conditions) : conditions.at(0);
}
//# sourceMappingURL=category-filter-interpreter-drizzle.js.map