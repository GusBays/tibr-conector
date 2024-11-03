"use strict";
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
exports.categoryBootstrap = categoryBootstrap;
const tsyringe_1 = require("tsyringe");
const category_1 = require("../../domain/category");
const category_service_1 = require("../../domain/category-service");
const category_repository_drizzle_1 = require("../repositories/drizzle/category-repository-drizzle");
function categoryBootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        tsyringe_1.container.register(category_1.CategoryTypeEnum.SERVICE, category_service_1.CategoryService);
        tsyringe_1.container.register(category_1.CategoryTypeEnum.REPOSITORY, category_repository_drizzle_1.CategoryRepositoryDrizzle);
    });
}
//# sourceMappingURL=category-bootstrap.js.map