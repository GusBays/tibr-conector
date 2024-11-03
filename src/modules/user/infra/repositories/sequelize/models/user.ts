import { AllowNull, Column, DataType, Model, Table, Unique } from 'sequelize-typescript'
import { User as IUser, UserType } from '../../../../domain/user'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model<IUser> {
    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly first_name: string

    @AllowNull
    @Column(DataType.STRING)
    declare readonly last_name: string

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    declare readonly email: string

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly password: string

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly type: UserType

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    declare readonly token: string
}
