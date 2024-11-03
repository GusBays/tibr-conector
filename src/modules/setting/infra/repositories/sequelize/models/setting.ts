import { AllowNull, Column, DataType, Model, Table } from 'sequelize-typescript'
import { AgisSetting, BagySetting, Setting as ISetting, PriceSetting } from '../../../../domain/setting'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Setting extends Model<ISetting> {
    @AllowNull(false)
    @Column(DataType.JSON)
    declare readonly agis: AgisSetting

    @AllowNull(false)
    @Column(DataType.JSON)
    declare readonly bagy: BagySetting

    @AllowNull
    @Column(DataType.JSON)
    declare readonly pricing: PriceSetting
}
