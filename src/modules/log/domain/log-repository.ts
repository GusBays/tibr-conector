import { Repository } from '../../../common/contracts/contracts'
import { Log, LogFilter } from './log'

export interface LogRepository extends Partial<Repository<LogFilter, Log>> {}
