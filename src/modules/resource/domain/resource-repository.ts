import { Repository } from "../../../common/contracts/contracts";
import { Resource, ResourceFilter } from "./resource";

export interface ResourceRepository extends Repository<ResourceFilter, Resource> {}