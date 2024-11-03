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
exports.CategoryRepositoryDrizzle = void 0;
const tsyringe_1 = require("tsyringe");
const drizzle_1 = require("../../../../../common/db/domain/drizzle/drizzle");
const category_schema_1 = require("./schemas/category-schema");
const category_filter_interpreter_drizzle_1 = require("./interpreters/category-filter-interpreter-drizzle");
let CategoryRepositoryDrizzle = class CategoryRepositoryDrizzle {
    constructor(db) {
        this.db = db;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [category] = yield this.db
                .insert(category_schema_1.categorySchema)
                .values(data);
            return yield this.getOne({ id: category.insertId });
        });
    }
    getOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const [category] = yield this.db
                .select()
                .from(category_schema_1.categorySchema)
                .where((0, category_filter_interpreter_drizzle_1.categoryFilterInterpreterDrizzle)(filter))
                .limit(1);
            return category;
        });
    }
};
exports.CategoryRepositoryDrizzle = CategoryRepositoryDrizzle;
exports.CategoryRepositoryDrizzle = CategoryRepositoryDrizzle = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(drizzle_1.DrizzleTypeEnum.CONNECTION)),
    __metadata("design:paramtypes", [Object])
], CategoryRepositoryDrizzle);
//# sourceMappingURL=category-repository-drizzle.js.map