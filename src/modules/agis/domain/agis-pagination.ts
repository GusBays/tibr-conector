export interface AgisPagination<T = any> {
    items: T[]
    search_criteria: AgisSearchCriteria
    total_count: number
}

export interface AgisSearchCriteria {
    filter_groups: []
    page_size: number
    current_page: number
}

export interface AgisPaginationParams {
    'searchCriteria[currentPage]'?: number
    'searchCriteria[pageSize]'?: number
}

export interface AgisProductParams {
    'searchCriteria[filterGroups][0][filters][0][field]': 'SKU'
    'searchCriteria[filterGroups][0][filters][0][value]': string
}
