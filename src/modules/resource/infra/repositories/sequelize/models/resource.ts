import { AfterCreate, AfterFind, AllowNull, Column, DataType, Model, Table } from 'sequelize-typescript'
import { isEmpty } from '../../../../../../common/helpers/helper'
import { ConnectionApi } from '../../../../../setting/domain/connection/connection'
import { ProductImage } from '../../../../domain/product/product-resource'
import { Resource as IResource, ResourceType } from '../../../../domain/resource'

@Table({ underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Resource extends Model<IResource> {
    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly type: ResourceType

    @AllowNull(false)
    @Column(DataType.STRING)
    declare readonly source: ConnectionApi

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
    declare readonly target: ConnectionApi

    @AllowNull
    @Column(DataType.INTEGER)
    declare readonly target_id: number

    @AllowNull
    @Column(DataType.JSON)
    declare readonly target_payload: Record<string, any>

    @AfterCreate
    @AfterFind
    static toSetImagesUrl(resource: Resource | Resource[]): void {
        if (isEmpty(resource)) return

        const setUrl = (resource: Resource) => {
            const { config } = resource

            if (isEmpty(config)) return

            const { images } = config

            if (isEmpty(images)) return

            const toSetUrl = (image: ProductImage) => {
                image.src = image.src.replace('media://', `${process.env.APP_URL}/`)
                return image
            }
            config.images = images.map(toSetUrl)
        }

        if (Array.isArray(resource)) resource.map(setUrl)
        else setUrl(resource)
    }
}
