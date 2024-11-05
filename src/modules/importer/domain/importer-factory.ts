import { NotImplemented } from '../../../common/exceptions/not-implemented'
import { ResourceType } from '../../resource/domain/resource'
import { ImporterConnection } from '../../setting/domain/connection/connection'
import { Setting } from '../../setting/domain/setting'
import { BagyProductImporter } from './bagy-product-importer'
import { Importer } from './importer'
import { isBagyImporter } from './importer-helper'

export class ImporterFactory {
    static getInstance(type: ResourceType, setting: Setting, importer: ImporterConnection): Importer {
        switch (type) {
            case ResourceType.PRODUCT:
                if (isBagyImporter(importer)) return new BagyProductImporter(setting, importer)
                throw new NotImplemented('product.importer')
            default:
                throw new NotImplemented('resource.type.importer')
        }
    }
}
