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
const dotenv_1 = require("dotenv");
const mysql2_1 = require("drizzle-orm/mysql2");
const migrator_1 = require("drizzle-orm/mysql2/migrator");
const promise_1 = __importDefault(require("mysql2/promise"));
const path_1 = require("path");
const config_1 = require("../../../config/config");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, dotenv_1.config)();
        const env = config_1.Config.get().mysql;
        const options = {
            host: env.host,
            port: env.port,
            user: env.user,
            password: env.password,
            database: env.database
        };
        let conn;
        try {
            conn = yield promise_1.default.createConnection(options);
        }
        catch (error) {
            throw new Error('mysql_connection_error -> ' + error);
        }
        const db = (0, mysql2_1.drizzle)(conn);
        yield (0, migrator_1.migrate)(db, { migrationsFolder: (0, path_1.resolve)('src', 'common', 'db', 'drizzle', 'infra', 'migrations') });
    });
}
run();
//# sourceMappingURL=drizzle-migrator.js.map