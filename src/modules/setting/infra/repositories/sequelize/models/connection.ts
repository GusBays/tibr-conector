import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript'
import { ConnectionApi, ConnectionType, Connection as IConnection } from '../../../../domain/connection/connection'
import { Setting } from './setting'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Connection extends Model<IConnection> {
    @AllowNull(false)
    @ForeignKey(() => Setting)
    @BelongsTo(() => Setting, { onUpdate: 'CASCADE', onDelete: 'CASCADE', as: 'setting' })
    @Column(DataType.INTEGER)
    declare readonly setting_id: number

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly type: ConnectionType

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly api: ConnectionApi

    @AllowNull(false)
    @Column(DataType.JSON)
    declare readonly config: Record<string, any>

    @AllowNull(false)
    @Default(1)
    @Column(DataType.BOOLEAN)
    declare readonly active: boolean
}
