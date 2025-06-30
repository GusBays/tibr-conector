import { getNamespace } from 'cls-hooked'
import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { container } from 'tsyringe'
import { History } from '../../../../modules/history/infra/repositories/sequelize/models/history'
import { Log } from '../../../../modules/log/infra/repositories/sequelize/models/log'
import { Resource } from '../../../../modules/resource/infra/repositories/sequelize/models/resource'
import { Connection } from '../../../../modules/setting/infra/repositories/sequelize/models/connection'
import { Setting } from '../../../../modules/setting/infra/repositories/sequelize/models/setting'
import { User } from '../../../../modules/user/infra/repositories/sequelize/models/user'
import { DbTypeEnum } from '../../domain/db'

export async function sequelizeBootstrap(): Promise<void> {
    const mysql: SequelizeOptions = {
        dialect: 'mysql',
        logging: 'development' === process.env.NODE_ENV,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        dialectOptions: {
            decimalNumbers: true
        }
    }

    const namespace = getNamespace('tibr-connector')
    Sequelize.useCLS(namespace)

    container.register(DbTypeEnum.CONNECTION, { useValue: new Sequelize(mysql) })
    const sequelize = container.resolve<Sequelize>(DbTypeEnum.CONNECTION)

    await sequelize.authenticate()
    sequelize.addModels([Connection, History, Log, Resource, Setting, User])

    await sequelize.sync()
}
