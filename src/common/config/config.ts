export interface MySql {
    host: string
    port: number
    user: string
    password: string
    database: string
}

export interface Bling {
    base_url: string
}

export interface Ingram {
    base_url: string
}

export interface IConfig {
    mysql: MySql
    bling: Bling
    ingram: Ingram
}

export class Config {
    static get(): IConfig {
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
        }
    }
}