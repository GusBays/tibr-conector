import { NotImplemented } from '../../../common/exceptions/not-implemented'
import { ResourceType } from '../../resource/domain/resource'
import { ImporterSetting } from '../../setting/domain/setting'
import { BagyProductImporter } from './bagy-product-importer'
import { Importer } from './importer'
import { isBagyImporter } from './importer-helper'

export class ImporterFactory {
    static getInstance(type: ResourceType, setting: ImporterSetting): Importer {
        switch (type) {
            case ResourceType.PRODUCT:
                if (isBagyImporter(setting)) return new BagyProductImporter(setting)
                throw new NotImplemented('product.importer')
            default:
                throw new NotImplemented('resource.type.importer')
        }
    }
}
