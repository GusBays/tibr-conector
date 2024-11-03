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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drizzleBootstrap = drizzleBootstrap;
const tsyringe_1 = require("tsyringe");
const mysql2_1 = require("drizzle-orm/mysql2");
const config_1 = require("../../../config/config");
const promise_1 = __importDefault(require("mysql2/promise"));
const drizzle_1 = require("../../domain/drizzle/drizzle");
function drizzleBootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const { mysql: env } = config_1.Config.get();
        const options = {
            host: env.host,
            port: env.port,
            user: env.user,
            password: env.password,
            database: env.database
        };
        const conn = yield promise_1.default.createConnection(options);
        tsyringe_1.container.register(drizzle_1.DrizzleTypeEnum.CONNECTION, {
            useValue: (0, mysql2_1.drizzle)(conn)
        });
    });
}
//# sourceMappingURL=drizzle-bootstrap.js.map