import { Filter, Model, Timestamps } from '../../../common/contracts/contracts'

export interface User extends Model, Timestamps {
    first_name: string
    last_name: string
    email: string
    token: string
    password: string
    type: UserType
    active: boolean
}

export interface UserFilter extends Partial<Model>, Filter {
    email?: string
    type?: UserType
    types?: UserType[]
    active?: boolean
    token?: string
}

export enum UserType {
    ADMIN = 'admin',
    OWNER = 'owner',
    SUPER = 'super'
}

export enum UserTypeEnum {
    SERVICE = 'UserService',
    REPOSITORY = 'UserRepository'
}
