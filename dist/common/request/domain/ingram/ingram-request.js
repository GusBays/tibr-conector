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
exports.IngramRequest = void 0;
const config_1 = require("../../../config/config");
const request_1 = require("../request");
class IngramRequest extends request_1.Request {
    constructor(token) {
        super(config_1.Config.get().ingram.base_url, {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }
    catalog(params) {
        const _super = Object.create(null, {
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.get.call(this, '/resellers/v6/catalog', params);
        });
    }
    catalogDetail(vendorPartNumber) {
        const _super = Object.create(null, {
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.get.call(this, `/resellers/v6/catalog/details/${vendorPartNumber}`);
        });
    }
    priceAndAvailability(body) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.post.call(this, '/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true&includeProductAttributes=true', body);
        });
    }
}
exports.IngramRequest = IngramRequest;
//# sourceMappingURL=ingram-request.js.map