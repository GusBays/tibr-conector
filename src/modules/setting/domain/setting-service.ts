import { container, inject, injectable } from 'tsyringe'
import { DB } from '../../../common/db/domain/db'
import { NotFound } from '../../../common/exceptions/not-found'
import { isEmpty, isNotEmpty, isUndefined, not, throwIf } from '../../../common/helpers/helper'
import { BagyAttribute, BagyAttributeValue } from '../../bagy/domain/bagy-attribute'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { Connection, ConnectionApi, ConnectionTypeEnum } from './connection/connection'
import { ConnectionService } from './connection/connection-service'
import { PricingSettingGroup, Setting, SettingBelongs, SettingFilter, SettingTypeEnum } from './setting'
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

    async syncPricingGroups(filter: SettingFilter): Promise<Setting> {
        const setting = await this.getOne(filter)

        const { pricing, connections } = setting

        const byApi = (connection: Connection) => ConnectionApi.BAGY === connection.api
        const bagy = connections.find(byApi)

        if (isEmpty(bagy) || not(bagy.active) || isEmpty(bagy.config.token)) return setting

        const request = new BagyRequest(bagy.config.token)

        let attribute: BagyAttribute

        if (isNotEmpty(pricing.attribute_id)) attribute = await request.getAttribute(pricing.attribute_id)
        else {
            const res = await request.getAttributes({ q: pricing.name })
            attribute = res.data.at(0)
        }

        if (isEmpty(attribute)) {
            const toBagyAttributeValue = (group: PricingSettingGroup, index: number): BagyAttributeValue =>
                ({
                    name: group.name,
                    position: index + 1
                } as BagyAttributeValue)
            const values = pricing.groups.map(toBagyAttributeValue)

            const data: BagyAttribute = {
                name: pricing.name,
                values
            } as BagyAttribute

            attribute = await request.createAttribute(data)
        }

        pricing.attribute_id = attribute.id
        const assignBagyId = (group: PricingSettingGroup) => {
            const byPosition = (value: BagyAttributeValue) => value.position === group.position
            const valueOnBagy = attribute.values.find(byPosition)

            group.attribute_value_id = valueOnBagy.id
        }
        pricing.groups.forEach(assignBagyId)

        return await this.update({ ...setting, pricing })
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
