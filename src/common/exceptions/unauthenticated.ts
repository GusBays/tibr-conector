import { Exception } from './exception'

export class Unauthenticated extends Exception {
    constructor() {
        super('unauthenticated')
    }
}
