import { container } from "tsyringe";
import { ResourceTypeEnum } from "../../domain/resource";
import { ResourceService } from "../../domain/resource-service";

export async function resourceBootstrap(): Promise<void> {
    container.register(ResourceTypeEnum.SERVICE, ResourceService)
    container.register(ResourceTypeEnum.REPOSITORY, )
}