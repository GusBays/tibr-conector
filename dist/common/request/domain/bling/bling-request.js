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
exports.BlingRequest = void 0;
const config_1 = require("../../../config/config");
const request_1 = require("../request");
class BlingRequest extends request_1.Request {
    constructor(token) {
        super(config_1.Config.get().bling.base_url, {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
    createCategory(category) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.post.call(this, '/categorias/produtos', category);
            return res.data;
        });
    }
    createProduct(product) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.post.call(this, '/produtos', product);
            return res.data;
        });
    }
    updateProduct(product) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield _super.post.call(this, `/produtos/${product.id}`, product);
            return res.data;
        });
    }
}
exports.BlingRequest = BlingRequest;
//# sourceMappingURL=bling-request.js.map