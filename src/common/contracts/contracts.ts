export interface Repository<F = any, T = any> {
    create(data: T): Promise<T>
    update(data: T): Promise<T>
    delete(filter: F): Promise<void>
    getOne(filter: F): Promise<T>
    getPaginate(filter: F): Promise<Meta<T>>
    getAll(filter: F): Promise<T[]>
}

export interface Meta<T = any> {
    data: T[]
    meta: {
        current_page: number
        from: number
        to: number
        total: number
        last_page: number
        per_page: number
    }
}

export interface Model {
    id: number
}

export interface Timestamps {
    created_at: string
    updated_at: string
}

export interface Filter {
    q?: string
    page?: number
    limit?: number
    sort?: string
}

export interface Dimensions {
    width: number
    height: number
    depth: number
    weight: number
}
