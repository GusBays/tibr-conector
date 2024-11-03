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
exports.Importer = void 0;
const tsyringe_1 = require("tsyringe");
const package_1 = require("../../../modules/package/domain/package");
const product_1 = require("../../../modules/product/domain/product");
const category_1 = require("../../../modules/category/domain/category");
const date_fns_1 = require("date-fns");
class Importer {
    constructor(data, request) {
        this.data = data;
        this.request = request;
        this.packageService = tsyringe_1.container.resolve(package_1.PackageTypeEnum.SERVICE);
        this.productService = tsyringe_1.container.resolve(product_1.ProductTypeEnum.SERVICE);
        this.categoryService = tsyringe_1.container.resolve(category_1.CategoryTypeEnum.SERVICE);
    }
    import() {
        return __awaiter(this, void 0, void 0, function* () {
            const toImport = (packageTarget) => __awaiter(this, void 0, void 0, function* () {
                const target = yield this.packageService.getOne({ id: packageTarget.target_id });
                yield this.importAllBy(target);
            });
            yield Promise.all(this.data.targets.map(toImport));
            const now = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd HH:mm:ss');
            yield this.packageService.update(Object.assign(Object.assign({}, this.data), { last_sync: now }));
        });
    }
}
exports.Importer = Importer;
//# sourceMappingURL=importer.js.map