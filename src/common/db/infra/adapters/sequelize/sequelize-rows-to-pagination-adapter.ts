import { FindOptions } from 'sequelize'
import { Model } from 'sequelize-typescript'
import { Meta } from '../../../../contracts/contracts'

export class SequelizeRowsToPaginationAdapter<T = any> {
    constructor(private rows: Model[], private options: FindOptions<T>, private total: number) {}

    getData(): Meta<T> {
        const toDataValues = (row: Model) => row.toJSON()
        const data = this.rows.map(toDataValues)

        const from = this.options.offset
        const page = from / this.options.limit + 1
        const perPage = this.options.limit
        const to = perPage * page
        const lastPage = Math.ceil(this.total / perPage)

        return {
            data,
            meta: {
                from,
                to,
                total: this.total,
                per_page: perPage,
                current_page: page,
                last_page: lastPage
            }
        }
    }
}
