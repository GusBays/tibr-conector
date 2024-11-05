import { container, inject, injectable } from 'tsyringe'
import { DB } from '../../../common/db/domain/db'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, isUndefined, throwIf } from '../../../common/helpers/helper'
import { Connection, ConnectionTypeEnum } from './connection/connection'
import { ConnectionService } from './connection/connection-service'
import { Setting, SettingBelongs, SettingFilter, SettingTypeEnum } from './setting'
import { SettingRepository } from './setting-repository'

@injectable()
export class SettingService {
    constructor(
        @inject(SettingTypeEnum.REPOSITORY) private readonly repository: SettingRepository,
        @inject(ConnectionTypeEnum.SERVICE) private readonly connectionService: ConnectionService
    ) {}

    static getInstance(): SettingService {
        return container.resolve(SettingTypeEnum.SERVICE)
    }

    async create(data: Setting): Promise<Setting> {
        return await DB.transaction(async () => {
            const setting = await this.repository.create(data)

            await Promise.all([this.setConnections(data.connections, setting)])

            return setting
        })
    }

    async getOne(filter: SettingFilter): Promise<Setting> {
        const setting = await this.repository.getOne(filter)
        throwIf(isEmpty(setting), NotFound, ['setting'])
        return setting
    }

    async update(data: Setting): Promise<Setting> {
        return await DB.transaction(async () => {
            const setting = await this.repository.update(data)

            await Promise.all([this.recreateConnections(data.connections, setting)])

            return setting
        })
    }

    private async setConnections(connections: Connection[], setting: Setting): Promise<void> {
        if (isEmpty(connections)) return

        const belongs = this.extractBelongsFrom(setting)
        const toAssignBelongs = (connection: Connection) => Object.assign(connection, belongs)
        const toCreate = async (connection: Connection) => await this.connectionService.create(connection)

        setting.connections = await Promise.all(connections.map(toAssignBelongs).map(toCreate))
    }

    private async recreateConnections(connections: Connection[], setting: Setting): Promise<void> {
        if (isUndefined(connections)) return

        await this.connectionService.delete({ setting_id: setting.id })
        await this.setConnections(connections, setting)
    }

    private extractBelongsFrom(setting: Setting): SettingBelongs {
        const { id: setting_id } = setting
        return { setting_id }
    }
}
