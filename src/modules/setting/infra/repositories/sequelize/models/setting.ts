import { AllowNull, Column, DataType, Model, Table } from 'sequelize-typescript'
import { Setting as ISetting, SettingConnection, SettingType } from '../../../../domain/setting'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Setting extends Model<ISetting> {
    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly connection: SettingConnection

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly type: SettingType

    @AllowNull
    @Column(DataType.JSON)
    declare readonly config: Record<string, any>

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    declare readonly active: boolean
}
