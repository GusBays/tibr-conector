"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlingPackage = isBlingPackage;
exports.isIngramPackage = isIngramPackage;
exports.isAgisPackage = isAgisPackage;
const store_package_1 = require("../../store-package/domain/store-package");
function isBlingPackage(data) {
    return data.settings.slug === store_package_1.StorePackages.BLING;
}
function isIngramPackage(data) {
    return data.settings.slug === store_package_1.StorePackages.INGRAM;
}
function isAgisPackage(data) {
    return data.settings.slug === store_package_1.StorePackages.AGIS;
}
//# sourceMappingURL=package-helper.js.map