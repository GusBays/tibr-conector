"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImporterFactory = void 0;
const package_helper_1 = require("../../../modules/package/domain/package-helper");
const ingram_product_importer_1 = require("./ingram/ingram-product-importer");
class ImporterFactory {
    static ofProduct(data) {
        if ((0, package_helper_1.isIngramPackage)(data))
            return new ingram_product_importer_1.IngramProductImporter(data);
        throw new Error('not_implemented_product_importer');
    }
}
exports.ImporterFactory = ImporterFactory;
//# sourceMappingURL=importer-factory.js.map