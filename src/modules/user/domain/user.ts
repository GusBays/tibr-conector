import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'

export interface User extends Model, Timestamps {
    first_name: string
    last_name: string
    name: string
    email: string
    token: string
    password: string
    type: UserType
}

export interface UserFilter extends Partial<Model>, Filter {
    email?: string
    type?: UserType
}

export enum UserType {
    ADMIN = 'admin',
    OWNER = 'owner'
}

export enum UserTypeEnum {
    SERVICE = 'UserService',
    REPOSITORY = 'UserRepository'
}
