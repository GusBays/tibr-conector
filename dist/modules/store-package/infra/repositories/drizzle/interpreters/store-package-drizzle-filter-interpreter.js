"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storePackageDrizzleFilterInterpreter = storePackageDrizzleFilterInterpreter;
const drizzle_orm_1 = require("drizzle-orm");
const store_package_schema_1 = require("../schemas/store-package-schema");
function storePackageDrizzleFilterInterpreter(filter) {
    const conditions = [];
    if (filter.id)
        conditions.push((0, drizzle_orm_1.eq)(store_package_schema_1.storePackageSchema.id, filter.id));
    if (filter.slug)
        conditions.push((0, drizzle_orm_1.eq)(store_package_schema_1.storePackageSchema.slug, filter.slug));
    if (filter.q) {
        const likePattern = `%${filter.q}%`;
        conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(store_package_schema_1.storePackageSchema.name, likePattern), (0, drizzle_orm_1.like)(store_package_schema_1.storePackageSchema.slug, likePattern)));
    }
    return conditions.length > 1 ? (0, drizzle_orm_1.and)(...conditions) : conditions.at(0);
}
//# sourceMappingURL=store-package-drizzle-filter-interpreter.js.map