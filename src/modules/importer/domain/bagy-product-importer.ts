import { isEmpty, isNotEmpty } from '../../../common/helpers/helper'
import { BagyProduct, BagyProductImage } from '../../bagy/domain/bagy-product'
import { BagyVariation } from '../../bagy/domain/bagy-variation'
import { BagyRequest } from '../../bagy/infra/http/axios/bagy-request'
import { isAgisFetcher } from '../../fetcher/domain/fetcher-helper'
import { ProductImage, ProductResourceConfig, Resource } from '../../resource/domain/resource'
import { BagyImporter } from '../../setting/domain/connection/bagy/bagy-connection'
import { Connection, ConnectionApi, FetcherConnection } from '../../setting/domain/connection/connection'
import { isFetcher } from '../../setting/domain/connection/connection-helper'
import { PricingSettingGroup, Setting } from '../../setting/domain/setting'
import { Importer } from './importer'

export class BagyProductImporter extends Importer<BagyImporter> {
    readonly api: ConnectionApi.BAGY

    private request: BagyRequest

    constructor(setting: Setting, importer: BagyImporter) {
        super(setting, importer)
        this.request = new BagyRequest(importer.config.token)
    }

    async importOne(resource: Resource<ProductResourceConfig>): Promise<Resource<ProductResourceConfig>> {
        const product = this.toBagyProduct(resource)

        if (isNotEmpty(product.id)) {
            const target_payload = await this.request.updateProduct(product)
            Object.assign(resource, { target_payload })
        } else {
            const res = await this.request.createProduct(product)
            Object.assign(resource, { target_id: res.id, target_payload: res })
        }

        this.afterCreate(resource)

        return resource
    }

    async deleteImage(productId: number, imageId: number): Promise<void> {
        try {
            await this.request.deleteProductImage(productId, imageId)
        } catch (e) {
            this.log(e)
        }
    }

    private toBagyProduct(resource: Resource<ProductResourceConfig>): BagyProduct {
        const byApi = (connection: Connection) => connection.api === resource.source && isFetcher(connection)
        const fetcher = this.setting.connections.find(byApi) as FetcherConnection

        const product: BagyProduct = {
            id: resource.target_id
        } as BagyProduct

        if (resource.config.partial_update && isNotEmpty(resource.target_payload)) {
            const toBalance = (variation: BagyVariation) =>
                ({ id: variation.id, balance: resource.config.balance } as BagyVariation)
            product.variations = (resource.target_payload as BagyProduct).variations.map(toBalance)
        } else {
            product.category_default_id = resource.config.category_default_id ?? this.importer.config.category_default_id
            product.name = resource.config.name
            product.short_description = resource.config.short_description
            product.description = resource.config.description

            if (isAgisFetcher(fetcher)) {
                const markup = isNotEmpty(resource.config.markup) ? resource.config.markup : fetcher.config.markup
                product.price = +(resource.config.price * (markup ?? 1)).toFixed(2)
            } else {
                product.price = +resource.config.price.toFixed(2)
            }

            product.weight = resource.config.weight
            product.height = resource.config.height
            product.width = resource.config.width
            product.depth = resource.config.depth
            product.active = resource.config.active
            product.short_description = resource.config.short_description
            product.external_id = resource.source_id.toString()
            product.ncm = resource.config.ncm

            const getCategoryIds = (): number[] => {
                const categoryDefaultId = resource.config.category_default_id ?? this.importer.config.category_default_id
                return isNotEmpty(categoryDefaultId) ? [categoryDefaultId] : []
            }
            product.category_ids = getCategoryIds()

            const getImages = (): BagyProductImage[] => {
                const { images } = resource.config

                if (isEmpty(images)) return null

                const toBagyProductImage = (image: ProductImage): BagyProductImage => {
                    const src = image.src.includes('media://')
                        ? image.src.replace('media://', `${process.env.APP_URL}/`)
                        : image.src

                    const { target_id: id, id: external_id, position } = image

                    return {
                        id,
                        src,
                        position,
                        external_id
                    }
                }
                return images.map(toBagyProductImage)
            }
            product.images = getImages()

            product.feature_ids = resource.config.feature_ids

            const toVariation = (group: PricingSettingGroup) => {
                const price = +(product.price * group.markup).toFixed(2)

                const variation: BagyVariation = {
                    product_id: product.id,
                    price,
                    price_compare: null,
                    attribute_value_id: group.attribute_value_id,
                    attribute_value_secondary_id: null,
                    balance: resource.config.balance,
                    position: group.position
                } as BagyVariation

                if (isNotEmpty(resource.target_payload)) {
                    const byAttributeValueId = (variation: BagyVariation) =>
                        variation.attribute_value_id === group.attribute_value_id
                    const variationOnBagy = (resource.target_payload as BagyProduct).variations?.find(byAttributeValueId)
                    variation.id = variationOnBagy.id
                }

                return variation
            }
            product.variations = this.setting.pricing.groups.map(toVariation)
        }

        return product
    }

    private afterCreate(resource: Resource<ProductResourceConfig>): void {
        if (isEmpty(resource.target_payload)) return

        const { images } = resource.target_payload as BagyProduct

        if (isNotEmpty(resource.config.images) && isNotEmpty(images)) {
            const setTargetId = (image: ProductImage) => {
                const byExternalId = (img: BagyProductImage) => img.external_id === image.id
                const bagyImage = images.find(byExternalId)

                if (isEmpty(bagyImage)) return

                image.target_id = bagyImage.id
            }
            resource.config.images.forEach(setTargetId)
        }
    }
}
