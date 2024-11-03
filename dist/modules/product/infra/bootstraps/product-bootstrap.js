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
exports.productBootstrap = productBootstrap;
const tsyringe_1 = require("tsyringe");
const product_1 = require("../../domain/product");
const product_repository_drizzle_1 = require("../repositories/drizzle/product-repository-drizzle");
const product_service_1 = require("../../domain/product-service");
function productBootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        tsyringe_1.container.register(product_1.ProductTypeEnum.SERVICE, product_service_1.ProductService);
        tsyringe_1.container.register(product_1.ProductTypeEnum.REPOSITORY, product_repository_drizzle_1.ProductRepositoryDrizzle);
    });
}
//# sourceMappingURL=product-bootstrap.js.map