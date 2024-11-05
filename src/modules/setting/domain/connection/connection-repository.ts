import { Repository } from '../../../../common/contracts/contracts'
import { Connection, ConnectionFilter } from './connection'

export interface ConnectionRepository extends Partial<Repository<ConnectionFilter, Connection>> {}
