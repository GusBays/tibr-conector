import { ProductResource } from "./product/product";
import { Resource, ResourceType } from "./resource";

export function isProductResource(data: Resource): data is ProductResource {
    return ResourceType.PRODUCT === data.type
}