import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Resource } from '../../../../../resource/infra/repositories/sequelize/models/resource'
import { Connection } from '../../../../../setting/infra/repositories/sequelize/models/connection'
import { Log as ILog } from '../../../../domain/log'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Log extends Model<ILog> {
    @AllowNull
    @ForeignKey(() => Connection)
    @BelongsTo(() => Connection, { onUpdate: 'CASCADE', onDelete: 'CASCADE', as: 'connection' })
    @Column(DataType.INTEGER)
    declare readonly connection_id: number

    @AllowNull
    @ForeignKey(() => Resource)
    @BelongsTo(() => Resource, { onUpdate: 'CASCADE', onDelete: 'CASCADE', as: 'resource' })
    @Column(DataType.INTEGER)
    declare readonly resource_id: number

    @AllowNull
    @Column(DataType.JSON)
    declare readonly payload: Record<string, any>

    @AllowNull(false)
    @Column(DataType.JSON)
    declare readonly message: Record<string, any>
}
