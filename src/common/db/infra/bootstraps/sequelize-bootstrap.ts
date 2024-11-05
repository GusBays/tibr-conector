import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { History } from '../../../../modules/history/infra/repositories/sequelize/models/history'
import { Resource } from '../../../../modules/resource/infra/repositories/sequelize/models/resource'
import { Setting } from '../../../../modules/setting/infra/repositories/sequelize/models/setting'
import { User } from '../../../../modules/user/infra/repositories/sequelize/models/user'

export async function sequelizeBootstrap(): Promise<void> {
    const mysql: SequelizeOptions = {
        dialect: 'mysql',
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    }

    const sequelize = new Sequelize(mysql)

    await sequelize.authenticate()
    sequelize.addModels([History, Resource, Setting, User])

    await sequelize.sync()
}
