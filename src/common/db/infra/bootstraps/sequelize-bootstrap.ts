import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { History } from '../../../../modules/history/infra/repositories/sequelize/models/history'
import { Resource } from '../../../../modules/resource/infra/repositories/sequelize/models/resource'
import { Connection } from '../../../../modules/setting/infra/repositories/sequelize/models/connection'
import { Setting } from '../../../../modules/setting/infra/repositories/sequelize/models/setting'
import { User } from '../../../../modules/user/infra/repositories/sequelize/models/user'

export async function sequelizeBootstrap(): Promise<void> {
    const mysql: SequelizeOptions = {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    }

    const sequelize = new Sequelize(mysql)

    await sequelize.authenticate()
    sequelize.addModels([Connection, History, Resource, Setting, User])

    await sequelize.sync()
}
