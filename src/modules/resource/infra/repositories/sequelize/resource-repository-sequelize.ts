import { FindOptions, literal, Op, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { Meta } from '../../../../../common/contracts/contracts'
import { SequelizeHelper } from '../../../../../common/db/domain/sequelize/sequelize-helper'
import { SequelizeRowsToPaginationAdapter } from '../../../../../common/db/infra/adapters/sequelize/sequelize-rows-to-pagination-adapter'
import { isNotEmpty } from '../../../../../common/helpers/helper'
import { ConnectionApi } from '../../../../setting/domain/connection/connection'
import { Resource as IResource, ResourceFilter } from '../../../domain/resource'
import { ResourceRepository } from '../../../domain/resource-repository'
import { Resource } from './models/resource'

@injectable()
export class ResourceRepositorySequelize implements ResourceRepository {
    async create(data: IResource): Promise<IResource> {
        const resource = await Resource.create(data)
        return resource.toJSON()
    }

    async getPaginate(filter: ResourceFilter): Promise<Meta<IResource>> {
        const query = this.interpret(filter)
        SequelizeHelper.setPaginationOn(query, filter)

        const { rows, count } = await Resource.findAndCountAll(query)

        return new SequelizeRowsToPaginationAdapter(rows, query, count).getData()
    }

    async getOne(filter: ResourceFilter): Promise<IResource> {
        const resource = await Resource.findOne(this.interpret(filter))
        return resource?.toJSON()
    }

    async update(data: IResource): Promise<IResource> {
        const filter = { id: data.id }
        await Resource.update(data, { where: filter })
        return await this.getOne(filter)
    }

    async delete(filter: ResourceFilter): Promise<void> {
        await Resource.destroy(this.interpret(filter))
    }

    async getAll(filter: ResourceFilter): Promise<IResource[]> {
        const resources = await Resource.findAll(this.interpret(filter))
        return resources.map(r => r.toJSON())
    }

    private interpret(filter: ResourceFilter): FindOptions<IResource> {
        const where: WhereOptions<IResource> = {}

        const { id, source, source_id, target, target_id, type, with_stock_on_agis, ignore_deleted, q } = filter

        if (isNotEmpty(id)) where.id = id
        if (isNotEmpty(source)) where.source = source
        if (isNotEmpty(source_id)) where.source_id = Array.isArray(source_id) ? { [Op.in]: source_id } : source_id
        if (isNotEmpty(target)) where.target = target
        if (isNotEmpty(target_id)) where.target_id = target_id
        if (isNotEmpty(type)) where.type = type
        if (isNotEmpty(with_stock_on_agis)) {
            where[Op.and] = [
                { source: ConnectionApi.AGIS },
                literal(`
                    (SELECT SUM(stock.qty)
                        FROM JSON_TABLE(
                            source_payload, 
                            '$.stock[*]' COLUMNS (
                            qty INT PATH '$.qty'
                        )
                    ) AS stock) ${Boolean(+with_stock_on_agis) ? '>' : '<='} 0
                `)
            ]
        }
        if (isNotEmpty(q)) {
            const pattern = `%${q}%`
            where[Op.or] = [
                { id: { [Op.like]: pattern } },
                literal(`JSON_EXTRACT(config, '$.name') LIKE '${pattern}' COLLATE utf8mb4_general_ci`)
            ]
        }

        return { where, paranoid: isNotEmpty(ignore_deleted) ? Boolean(+ignore_deleted) : true }
    }
}
