"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    static get() {
        return {
            ingram: {
                base_url: process.env.INGRAM_BASE_URL
            },
            bling: {
                base_url: process.env.BLING_BASE_URL
            },
            mysql: {
                host: process.env.DB_HOST,
                port: +process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            }
        };
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map