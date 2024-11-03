export type ErrorConstructor = new (...args: any[]) => Error

export function throwIf(condition: boolean, Ex: ErrorConstructor, ...args: any[]): void {
    if (!condition) return
    else throw new Ex(args)
}

export function isNull(value: any) {
    return value === null
}

export function isUndefined(value: any) {
    return value === undefined
}

export function isEmpty(value: any) {
    if (Array.isArray(value)) return !value.length
    if (typeof value === 'string') return !value
    return isNull(value) || isUndefined(value)
}

export function isNotEmpty(value: any): boolean {
    return not(isEmpty(value))
}

export function not(value: any): boolean {
    return !value
}
