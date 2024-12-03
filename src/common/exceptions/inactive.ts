import { Exception } from './exception'

export class Inactive extends Exception {
    constructor() {
        super('inactive_user')
    }
}
