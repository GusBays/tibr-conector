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
exports.StorePackageRepositoryDrizzle = void 0;
const tsyringe_1 = require("tsyringe");
const drizzle_1 = require("../../../../../common/db/domain/drizzle/drizzle");
const store_package_schema_1 = require("./schemas/store-package-schema");
const store_package_drizzle_filter_interpreter_1 = require("./interpreters/store-package-drizzle-filter-interpreter");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_helper_1 = require("../../../../../common/db/domain/drizzle/drizzle-helper");
const drizzle_rows_to_meta_adapter_1 = require("../../../../../common/db/drizzle/adapters/drizzle-rows-to-meta-adapter");
let StorePackageRepositoryDrizzle = class StorePackageRepositoryDrizzle {
    constructor(db) {
        this.db = db;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [storePackage] = yield this.db
                .insert(store_package_schema_1.storePackageSchema)
                .values(data);
            return this.getOne({ id: storePackage.insertId });
        });
    }
    getPaginate(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreted = (0, store_package_drizzle_filter_interpreter_1.storePackageDrizzleFilterInterpreter)(filter);
            const storePackages = yield this.db
                .select()
                .from(store_package_schema_1.storePackageSchema)
                .where(interpreted)
                .offset(drizzle_helper_1.DrizzleHelper.getOffsetBy(filter))
                .limit(drizzle_helper_1.DrizzleHelper.getLimitBy(filter));
            const total = yield this.db.select({ count: (0, drizzle_orm_1.count)() }).from(store_package_schema_1.storePackageSchema).where(interpreted);
            return new drizzle_rows_to_meta_adapter_1.DrizzleRowsToMetaAdapter(storePackages, total.at(0).count, filter).getData();
        });
    }
    getOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreted = (0, store_package_drizzle_filter_interpreter_1.storePackageDrizzleFilterInterpreter)(filter);
            const storePackage = yield this.db
                .select()
                .from(store_package_schema_1.storePackageSchema)
                .where(interpreted)
                .limit(1);
            return storePackage.at(0);
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { id: data.id };
            const interpreted = (0, store_package_drizzle_filter_interpreter_1.storePackageDrizzleFilterInterpreter)(filter);
            yield this.db
                .update(store_package_schema_1.storePackageSchema)
                .set(data)
                .where(interpreted);
            return yield this.getOne(filter);
        });
    }
    delete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreted = (0, store_package_drizzle_filter_interpreter_1.storePackageDrizzleFilterInterpreter)(filter);
            yield this.db
                .delete(store_package_schema_1.storePackageSchema)
                .where(interpreted);
        });
    }
};
exports.StorePackageRepositoryDrizzle = StorePackageRepositoryDrizzle;
exports.StorePackageRepositoryDrizzle = StorePackageRepositoryDrizzle = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(drizzle_1.DrizzleTypeEnum.CONNECTION)),
    __metadata("design:paramtypes", [Object])
], StorePackageRepositoryDrizzle);
//# sourceMappingURL=store-package-repository-drizzle.js.map