export interface BagyParams extends Record<string, any> {
    id?: number
    q?: string
}

export interface BagyPagination<T = any> {
    data: T[]
    meta: Record<string, any>
}
