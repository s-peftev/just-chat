export interface PaginatedResult<T> {
    metadata: PaginationMetadata,
    items: T[]
}

export interface PaginationMetadata {
    currentPage: number,
    pageSize: number,
    totalPages: number,
    totalCount: number
}