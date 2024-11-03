import { Repository } from '../../../common/contracts/contracts'
import { User, UserFilter } from './user'

export interface UserRepository extends Partial<Repository<UserFilter, User>> {}
