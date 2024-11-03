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
exports.ProductRepositoryDrizzle = void 0;
const tsyringe_1 = require("tsyringe");
const drizzle_1 = require("../../../../../common/db/domain/drizzle/drizzle");
const product_schema_1 = require("./schemas/product-schema");
const drizzle_helper_1 = require("../../../../../common/db/domain/drizzle/drizzle-helper");
const product_filter_interpreter_drizzle_1 = require("./interpreters/product-filter-interpreter-drizzle");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_rows_to_meta_adapter_1 = require("../../../../../common/db/drizzle/adapters/drizzle-rows-to-meta-adapter");
const product_image_schema_1 = require("./schemas/product-image-schema");
let ProductRepositoryDrizzle = class ProductRepositoryDrizzle {
    constructor(db) {
        this.db = db;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [product] = yield this.db
                .insert(product_schema_1.productSchema)
                /** @ts-ignore */
                .values(data);
            if (data.images) {
                const toSetProductId = (image) => Object.assign(image, { product_id: product.insertId });
                const toCreate = (image) => __awaiter(this, void 0, void 0, function* () { return yield this.db.insert(product_image_schema_1.productImageSchema).values(image); });
                yield Promise.all(data.images.map(toSetProductId).map(toCreate));
            }
            return yield this.getOne({ id: product.insertId });
        });
    }
    getPaginate(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreted = (0, product_filter_interpreter_drizzle_1.productFilterInterpreterDrizzle)(filter);
            const rows = yield this.db
                .select()
                .from(product_schema_1.productSchema)
                .where(interpreted)
                .limit(drizzle_helper_1.DrizzleHelper.getLimitBy(filter))
                .offset(drizzle_helper_1.DrizzleHelper.getOffsetBy(filter));
            const toGetImages = (row) => __awaiter(this, void 0, void 0, function* () {
                const images = yield this.db.select().from(product_image_schema_1.productImageSchema).where((0, drizzle_orm_1.eq)(product_image_schema_1.productImageSchema.product_id, row.id));
                return Object.assign(row, { images });
            });
            const products = yield Promise.all((rows).map(toGetImages));
            const total = yield this.db.select({ count: (0, drizzle_orm_1.count)() }).from(product_schema_1.productSchema).where(interpreted);
            return new drizzle_rows_to_meta_adapter_1.DrizzleRowsToMetaAdapter(products, total.at(0).count, filter).getData();
        });
    }
    getOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const [product] = yield this.db
                .select()
                .from(product_schema_1.productSchema)
                .where((0, product_filter_interpreter_drizzle_1.productFilterInterpreterDrizzle)(filter))
                .limit(1);
            const images = yield this.db.select().from(product_image_schema_1.productImageSchema).where((0, drizzle_orm_1.eq)(product_image_schema_1.productImageSchema.product_id, product.id));
            Object.assign(product, { images });
            return product;
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { id: data.id };
            yield this.db
                .update(product_schema_1.productSchema)
                /** @ts-ignore */
                .set(data)
                .where((0, product_filter_interpreter_drizzle_1.productFilterInterpreterDrizzle)(filter));
            if (data.images) {
                yield this.db.delete(product_image_schema_1.productImageSchema).where((0, drizzle_orm_1.eq)(product_image_schema_1.productImageSchema.product_id, data.id));
                yield this.db.insert(product_image_schema_1.productImageSchema).values(data.images);
            }
            return yield this.getOne(filter);
        });
    }
    delete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db
                .delete(product_schema_1.productSchema)
                .where((0, product_filter_interpreter_drizzle_1.productFilterInterpreterDrizzle)(filter));
        });
    }
    getAll(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreted = (0, product_filter_interpreter_drizzle_1.productFilterInterpreterDrizzle)(filter);
            const rows = yield this.db
                .select()
                .from(product_schema_1.productSchema)
                .where(interpreted);
            const toGetImages = (row) => __awaiter(this, void 0, void 0, function* () {
                const images = yield this.db.select().from(product_image_schema_1.productImageSchema).where((0, drizzle_orm_1.eq)(product_image_schema_1.productImageSchema.product_id, row.id));
                return Object.assign(row, { images });
            });
            const products = yield Promise.all(rows.map(toGetImages));
            return products;
        });
    }
};
exports.ProductRepositoryDrizzle = ProductRepositoryDrizzle;
exports.ProductRepositoryDrizzle = ProductRepositoryDrizzle = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(drizzle_1.DrizzleTypeEnum.CONNECTION)),
    __metadata("design:paramtypes", [Object])
], ProductRepositoryDrizzle);
//# sourceMappingURL=product-repository-drizzle.js.map