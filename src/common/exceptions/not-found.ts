import { Exception } from './exception'

export class NotFound extends Exception {
    constructor(subject: string) {
        super(`${subject}.not_found`)
    }
}
