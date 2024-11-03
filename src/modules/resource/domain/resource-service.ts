import { inject, injectable } from "tsyringe";
import { ResourceTypeEnum } from "./resource";
import { ResourceRepository } from "./resource-repository";

@injectable()
export class ResourceService {
    constructor(@inject(ResourceTypeEnum.SERVICE) private readonly repository: ResourceRepository) {}
}