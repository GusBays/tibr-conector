import { ProductResourceConfig, Resource, ResourceType } from './resource'

export function isProductResource(data: Resource): data is Resource<ProductResourceConfig> {
    return ResourceType.PRODUCT === data.type
}
