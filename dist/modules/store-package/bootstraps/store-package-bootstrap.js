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
exports.storePackageBootstrap = storePackageBootstrap;
const tsyringe_1 = require("tsyringe");
const store_package_1 = require("../domain/store-package");
const store_package_service_1 = require("../domain/store-package-service");
const store_package_repository_drizzle_1 = require("../infra/repositories/drizzle/store-package-repository-drizzle");
function storePackageBootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        tsyringe_1.container.register(store_package_1.StorePackageTypeEnum.SERVICE, store_package_service_1.StorePackageService);
        tsyringe_1.container.register(store_package_1.StorePackageTypeEnum.REPOSITORY, store_package_repository_drizzle_1.StorePackageRepositoryDrizzle);
    });
}
//# sourceMappingURL=store-package-bootstrap.js.map