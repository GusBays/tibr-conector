import { NotFound } from '../../../../exceptions/not-found'

export function route(): void {
    throw new NotFound('route')
}
