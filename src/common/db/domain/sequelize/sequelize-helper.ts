import { FindOptions } from 'sequelize'
import { Filter } from '../../../contracts/contracts'
import { isEmpty } from '../../../helpers/helper'

export class SequelizeHelper {
    private static perPageMin = 15
    private static perPageMax = 1000

    static setPaginationOn<T extends Record<string, any>>(options: FindOptions<T>, filter: Filter): void {
        const limit = filter.limit ?? this.perPageMin

        const minPerPage = Math.max(+limit, this.perPageMin)
        const perPage = Math.min(minPerPage, this.perPageMax)

        const currentPage = filter.page ?? 1
        const from = (+currentPage - 1) * perPage

        Object.assign(options, { offset: from, limit: perPage })

        if (isEmpty(filter.sort)) return

        const direction = filter.sort.includes('-') ? 'DESC' : 'ASC'
        const field = filter.sort.replace('-', '')

        Object.assign(options, { order: [[field, direction]] })
    }
}
