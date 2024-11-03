"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageRepositoryDrizzle = void 0;
const tsyringe_1 = require("tsyringe");
const drizzle_1 = require("../../../../../common/db/domain/drizzle/drizzle");
const package_schema_1 = require("./schemas/package-schema");
const package_filter_interpreter_drizzle_1 = require("./interpreters/package-filter-interpreter-drizzle");
const package_target_schema_1 = require("./schemas/package-target-schema");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_helper_1 = require("../../../../../common/db/domain/drizzle/drizzle-helper");
const drizzle_rows_to_meta_adapter_1 = require("../../../../../common/db/drizzle/adapters/drizzle-rows-to-meta-adapter");
let PackageRepositoryDrizzle = class PackageRepositoryDrizzle {
    constructor(db) {
        this.db = db;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [row] = yield this.db
                .insert(package_schema_1.packageSchema)
                .values(data);
            if (data.targets) {
                const toSetPackageId = (target) => Object.assign(target, { package_id: row.insertId });
                const toCreate = (target) => __awaiter(this, void 0, void 0, function* () { return yield this.db.insert(package_target_schema_1.packageTargetSchema).values(target); });
                yield Promise.all(data.targets.map(toSetPackageId).map(toCreate));
            }
            return this.getOne({ id: row.insertId });
        });
    }
    getPaginate(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreted = (0, package_filter_interpreter_drizzle_1.packageFilterInterpreterDrizzle)(filter);
            const rows = yield this.db
                .select()
                .from(package_schema_1.packageSchema)
                .where(interpreted)
                .limit(drizzle_helper_1.DrizzleHelper.getLimitBy(filter))
                .offset(drizzle_helper_1.DrizzleHelper.getOffsetBy(filter));
            const toGetTargets = (row) => __awaiter(this, void 0, void 0, function* () {
                const targets = yield this.db.select().from(package_target_schema_1.packageTargetSchema).where((0, drizzle_orm_1.eq)(package_target_schema_1.packageTargetSchema.package_id, row.id));
                return Object.assign(row, { targets });
            });
            const packages = yield Promise.all(rows.map(toGetTargets));
            const total = yield this.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(package_schema_1.packageSchema)
                .where(interpreted);
            return new drizzle_rows_to_meta_adapter_1.DrizzleRowsToMetaAdapter(packages, total.at(0).count, filter).getData();
        });
    }
    getOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const [row] = yield this.db
                .select()
                .from(package_schema_1.packageSchema)
                .where((0, package_filter_interpreter_drizzle_1.packageFilterInterpreterDrizzle)(filter))
                .limit(1);
            const targets = yield this.db.select().from(package_target_schema_1.packageTargetSchema).where((0, drizzle_orm_1.eq)(package_target_schema_1.packageTargetSchema.package_id, row.id));
            Object.assign(row, { targets });
            return row;
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { id: data.id };
            yield this.db
                .update(package_schema_1.packageSchema)
                .set(data)
                .where((0, package_filter_interpreter_drizzle_1.packageFilterInterpreterDrizzle)(filter));
            if (data.targets) {
                yield this.db.delete(package_target_schema_1.packageTargetSchema).where((0, drizzle_orm_1.eq)(package_target_schema_1.packageTargetSchema.package_id, data.id));
                yield this.db.insert(package_target_schema_1.packageTargetSchema).values(data.targets);
            }
            return this.getOne(filter);
        });
    }
    delete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db
                .delete(package_schema_1.packageSchema)
                .where((0, package_filter_interpreter_drizzle_1.packageFilterInterpreterDrizzle)(filter));
        });
    }
    getAll(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.db.select().from(package_schema_1.packageSchema).where((0, package_filter_interpreter_drizzle_1.packageFilterInterpreterDrizzle)(filter));
            const toGetTargets = (row) => __awaiter(this, void 0, void 0, function* () {
                const targets = yield this.db.select().from(package_target_schema_1.packageTargetSchema).where((0, drizzle_orm_1.eq)(package_target_schema_1.packageTargetSchema.package_id, row.id));
                return Object.assign(row, { targets });
            });
            const packages = yield Promise.all(rows.map(toGetTargets));
            return packages;
        });
    }
};
exports.PackageRepositoryDrizzle = PackageRepositoryDrizzle;
exports.PackageRepositoryDrizzle = PackageRepositoryDrizzle = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(drizzle_1.DrizzleTypeEnum.CONNECTION)),
    __metadata("design:paramtypes", [Object])
], PackageRepositoryDrizzle);
//# sourceMappingURL=package-repository-drizzle.js.map