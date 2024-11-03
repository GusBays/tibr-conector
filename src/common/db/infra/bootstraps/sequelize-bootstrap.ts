import { Sequelize } from 'sequelize-typescript'
import { AccessToken } from '../../../../modules/access-token/infra/repositories/sequelize/models/access-token'
import { Client } from '../../../../modules/client/infra/repositories/sequelize/models/client'
import { Code } from '../../../../modules/code/infra/repositories/sequelize/models/code'
import { Platform } from '../../../../modules/platform/infra/repositories/sequelize/models/platform'
import { RefreshToken } from '../../../../modules/refresh-token/infra/repositories/sequelize/models/refresh-token'
import { User } from '../../../../modules/user/infra/repositories/sequelize/models/user'
import { UserCompany } from '../../../../modules/user/infra/repositories/sequelize/models/user-company'
import { Bootstrap } from '../../../bootstrap/domain/bootstrap'
import { Config } from '../../../environment/domain/environment'

export class SequelizeBootstrap implements Bootstrap {
    async init(): Promise<void> {
        const { mysql } = Config.get()

        const sequelize = new Sequelize(mysql)

        await sequelize.authenticate()
        sequelize.addModels([AccessToken, Client, Code, Platform, RefreshToken, User, UserCompany])

        await sequelize.sync()
    }
}
