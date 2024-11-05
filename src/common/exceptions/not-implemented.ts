import { Exception } from './exception'

export class NotImplemented extends Exception {
    constructor(subject: string) {
        super(`${subject}.not_implemented`)
    }
}
