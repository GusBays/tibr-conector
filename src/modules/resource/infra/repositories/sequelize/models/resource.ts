import { AllowNull, Column, DataType, Model, Table } from 'sequelize-typescript'
import { Resource as IResource, ResourceSource, ResourceTarget, ResourceType } from '../../../../domain/resource'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Resource extends Model<IResource> {
    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly type: ResourceType

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly source: ResourceSource

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare readonly source_id: number

    @AllowNull(false)
    @Column(DataType.JSON)
    declare readonly source_payload: Record<string, any>

    @AllowNull
    @Column(DataType.JSON)
    declare readonly config: Record<string, any>

    @AllowNull
    @Column(DataType.STRING)
    declare readonly target: ResourceTarget

    @AllowNull
    @Column(DataType.INTEGER)
    declare readonly target_id: number

    @AllowNull
    @Column(DataType.JSON)
    declare readonly target_payload: Record<string, any>
}
