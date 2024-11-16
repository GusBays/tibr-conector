import { Exception } from './exception'

export class Unauthorized extends Exception {
    constructor() {
        super('unauthenticated')
    }
}
