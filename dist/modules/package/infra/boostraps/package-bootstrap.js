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
exports.packageBootstrap = packageBootstrap;
const tsyringe_1 = require("tsyringe");
const package_1 = require("../../domain/package");
const package_service_1 = require("../../domain/package-service");
const package_repository_drizzle_1 = require("../repositories/drizzle/package-repository-drizzle");
function packageBootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        tsyringe_1.container.register(package_1.PackageTypeEnum.SERVICE, package_service_1.PackageService);
        tsyringe_1.container.register(package_1.PackageTypeEnum.REPOSITORY, package_repository_drizzle_1.PackageRepositoryDrizzle);
    });
}
//# sourceMappingURL=package-bootstrap.js.map