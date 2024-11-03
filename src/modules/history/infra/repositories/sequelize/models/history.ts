import { AllowNull, Column, DataType, Model, Table } from 'sequelize-typescript'
import { HistoryType, History as IHistory } from '../../../../domain/history'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class History extends Model<IHistory> {
    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly type: HistoryType

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly source: string

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly target: string

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly started_at: string

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly ended_at: string

    @AllowNull
    @Column(DataType.JSON)
    declare readonly extra: Record<string, any>
}
