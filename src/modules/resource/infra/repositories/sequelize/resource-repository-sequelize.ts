import { FindOptions, WhereOptions } from 'sequelize'
import { injectable } from 'tsyringe'
import { Meta } from '../../../../../common/contracts/contracts'
import { SequelizeHelper } from '../../../../../common/db/domain/sequelize/sequelize-helper'
import { SequelizeRowsToPaginationAdapter } from '../../../../../common/db/infra/adapters/sequelize/sequelize-rows-to-pagination-adapter'
import { isNotEmpty } from '../../../../../common/helpers/helper'
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

    private interpret(filter: ResourceFilter): FindOptions<IResource> {
        const where: WhereOptions<IResource> = {}

        const { id, source, source_id, target, target_id, type } = filter

        if (isNotEmpty(id)) where.id = id
        if (isNotEmpty(source)) where.source = source
        if (isNotEmpty(source_id)) where.source_id = source_id
        if (isNotEmpty(target)) where.target = target
        if (isNotEmpty(target_id)) where.target_id = target_id
        if (isNotEmpty(type)) where.type = type

        return { where }
    }
}
