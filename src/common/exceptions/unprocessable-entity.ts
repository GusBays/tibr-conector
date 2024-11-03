import { Exception } from './exception'

export class UnprocessableEntity extends Exception {
    constructor(subject: string, public causes?: Record<string, any>) {
        super(`${subject}.unprocessable_entity`)
    }
}
