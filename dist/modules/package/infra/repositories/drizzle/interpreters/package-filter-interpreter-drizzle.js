"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageFilterInterpreterDrizzle = packageFilterInterpreterDrizzle;
const drizzle_orm_1 = require("drizzle-orm");
const package_schema_1 = require("../schemas/package-schema");
const tsyringe_1 = require("tsyringe");
const drizzle_1 = require("../../../../../../common/db/domain/drizzle/drizzle");
const package_target_schema_1 = require("../schemas/package-target-schema");
function packageFilterInterpreterDrizzle(filter) {
    const conditions = [];
    if (filter.id)
        conditions.push((0, drizzle_orm_1.eq)(package_schema_1.packageSchema.id, filter.id));
    if (filter.store_package_id)
        conditions.push((0, drizzle_orm_1.eq)(package_schema_1.packageSchema.store_package_id, filter.store_package_id));
    if (undefined !== filter.with_targets) {
        const db = tsyringe_1.container.resolve(drizzle_1.DrizzleTypeEnum.CONNECTION);
        const query = db.select()
            .from(package_target_schema_1.packageTargetSchema)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(package_target_schema_1.packageTargetSchema.package_id, package_schema_1.packageSchema.id), (0, drizzle_orm_1.eq)(package_schema_1.packageSchema.active, true)))
            .innerJoin(package_schema_1.packageSchema, (0, drizzle_orm_1.eq)(package_schema_1.packageSchema.id, package_target_schema_1.packageTargetSchema.target_id));
        true === Boolean(filter.with_targets) ? conditions.push((0, drizzle_orm_1.exists)(query)) : conditions.push((0, drizzle_orm_1.notExists)(query));
    }
    return conditions.length > 1 ? (0, drizzle_orm_1.and)(...conditions) : conditions.at(0);
}
//# sourceMappingURL=package-filter-interpreter-drizzle.js.map