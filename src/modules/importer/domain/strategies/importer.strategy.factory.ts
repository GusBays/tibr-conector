import { NotImplemented } from '../../../../common/exceptions/not-implemented'
import { ResourceType } from '../../../resource/domain/resource'
import { ImporterConnection } from '../../../setting/domain/connection/connection'
import { Setting } from '../../../setting/domain/setting'
import { isBagyImporter } from '../importer-helper'
import { BagyProductImporterStrategy } from './bagy-product-importer.strategy'
import { ImporterStrategy } from './importer.strategy'

export class ImporterStrategyFactory {
    static getInstance(type: ResourceType, setting: Setting, importer: ImporterConnection): ImporterStrategy {
        switch (type) {
            case ResourceType.PRODUCT:
                if (isBagyImporter(importer)) return new BagyProductImporterStrategy(setting, importer)
                throw new NotImplemented('product.importer')
            default:
                throw new NotImplemented('resource.type.importer')
        }
    }
}
