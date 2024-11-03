"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFilterInterpreterDrizzle = logFilterInterpreterDrizzle;
const drizzle_orm_1 = require("drizzle-orm");
const log_schema_1 = require("../schemas/log-schema");
function logFilterInterpreterDrizzle(filter) {
    const conditions = [];
    const { id, package_id } = filter;
    if (id)
        conditions.push((0, drizzle_orm_1.eq)(log_schema_1.logSchema.id, id));
    if (package_id)
        conditions.push((0, drizzle_orm_1.eq)(log_schema_1.logSchema.package_id, package_id));
    return conditions.length > 1 ? (0, drizzle_orm_1.and)(...conditions) : conditions.at(0);
}
//# sourceMappingURL=log-filter-interpreter-drizzle.js.map