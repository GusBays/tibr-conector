"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwIf = throwIf;
function throwIf(condition, Ex, ...args) {
    if (!condition)
        return;
    else
        throw new Ex(args);
}
//# sourceMappingURL=helper.js.map