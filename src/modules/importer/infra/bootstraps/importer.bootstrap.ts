import { container } from 'tsyringe'
import { ImporterTypeEnum } from '../../domain/importer'
import { ImporterService } from '../../domain/importer.service'

export async function importerBootstrap() {
    container.register(ImporterTypeEnum.SERVICE, ImporterService)
}
