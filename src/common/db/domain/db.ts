import { getNamespace } from 'cls-hooked'
import { Sequelize } from 'sequelize-typescript'
import { container } from 'tsyringe'

export class DB {
    static async transaction<T = any>(callback: () => Promise<T>): Promise<T> {
        const env = process.env.NODE_ENV

        if ('test' === env) return await callback()

        const sequelize = container.resolve<Sequelize>(DbTypeEnum.CONNECTION)
        const namespace = getNamespace('tibr-connector')

        const transaction = namespace.get('transaction')
        if (transaction) return await callback()
        else return await sequelize.transaction(callback)
    }
}

export enum DbTypeEnum {
    CONNECTION = 'connection'
}
