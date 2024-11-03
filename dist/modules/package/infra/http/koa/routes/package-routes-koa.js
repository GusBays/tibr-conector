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
exports.packageRoutesKoa = packageRoutesKoa;
const tsyringe_1 = require("tsyringe");
const package_1 = require("../../../../domain/package");
const path = '/packages';
function packageRoutesKoa(router) {
    return __awaiter(this, void 0, void 0, function* () {
        const service = tsyringe_1.container.resolve(package_1.PackageTypeEnum.SERVICE);
        function store(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                const body = yield service.create(ctx.request.body);
                Object.assign(ctx, { body, status: 201 });
            });
        }
        function index(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                const body = yield service.getPaginate(Object.assign(Object.assign({}, ctx.query), ctx.params));
                Object.assign(ctx, { body, status: 200 });
            });
        }
        function show(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                const body = yield service.getOne({ id: Number(ctx.params.id) });
                Object.assign(ctx, { body, status: 200 });
            });
        }
        function update(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                const body = yield service.update(ctx.request.body);
                Object.assign(ctx, { status: 204 });
            });
        }
        function destroy(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                yield service.delete({ id: Number(ctx.params.id) });
                Object.assign(ctx, { status: 204 });
            });
        }
        router.post(path, store);
        router.get(path, index);
        router.get(`${path}/:id`, show);
        router.put(`${path}/:id`, update);
        router.delete(`${path}/:id`, destroy);
    });
}
//# sourceMappingURL=package-routes-koa.js.map