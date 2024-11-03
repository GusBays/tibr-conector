import { Repository } from '../../../common/contracts/contracts'
import { History, HistoryFilter } from '../domain/history'

export interface HistoryRepository extends Partial<Repository<HistoryFilter, History>> {}
