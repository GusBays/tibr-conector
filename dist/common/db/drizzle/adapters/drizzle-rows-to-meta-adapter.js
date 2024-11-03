"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleRowsToMetaAdapter = void 0;
const drizzle_helper_1 = require("../../domain/drizzle/drizzle-helper");
class DrizzleRowsToMetaAdapter {
    constructor(rows, total, filter) {
        this.rows = rows;
        this.total = total;
        this.filter = filter;
    }
    getData() {
        var _a;
        const offset = drizzle_helper_1.DrizzleHelper.getOffsetBy(this.filter);
        const perPage = drizzle_helper_1.DrizzleHelper.getLimitBy(this.filter);
        const currentPage = (_a = this.filter.page) !== null && _a !== void 0 ? _a : 1;
        const to = perPage * +currentPage;
        const lastPage = Math.ceil(this.total / perPage);
        return {
            data: this.rows,
            meta: {
                from: offset,
                to: to,
                total: this.total,
                per_page: perPage,
                current_page: +currentPage,
                last_page: lastPage
            }
        };
    }
}
exports.DrizzleRowsToMetaAdapter = DrizzleRowsToMetaAdapter;
//# sourceMappingURL=drizzle-rows-to-meta-adapter.js.map