"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleHelper = void 0;
const perPageMin = 15;
const perPageMax = 150;
class DrizzleHelper {
    static getOffsetBy(filter) {
        var _a;
        const perPage = this.getLimitBy(filter);
        const currentPage = (_a = filter.page) !== null && _a !== void 0 ? _a : 1;
        const from = (+currentPage - 1) * perPage;
        return from;
    }
    static getLimitBy(filter) {
        var _a;
        const limit = (_a = filter.limit) !== null && _a !== void 0 ? _a : perPageMin;
        const minPerPage = Math.max(+limit, perPageMin);
        const perPage = Math.min(minPerPage, perPageMax);
        return perPage;
    }
}
exports.DrizzleHelper = DrizzleHelper;
//# sourceMappingURL=drizzle-helper.js.map