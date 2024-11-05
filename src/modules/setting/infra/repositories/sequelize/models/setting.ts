import { AllowNull, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { Connection as ISettingConnection } from '../../../../domain/connection/connection'
import { Setting as ISetting, SettingPricing } from '../../../../domain/setting'
import { Connection } from './connection'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Setting extends Model<ISetting> {
    @AllowNull(false)
    @Column(DataType.JSON)
    declare readonly pricing: SettingPricing

    @HasMany(() => Connection)
    declare readonly connections: ISettingConnection[]
}
