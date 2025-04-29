export type LaravelPaginationLinks = {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
};

export type LaravelPaginationMetaLink = {
    url: string | null;
    label: string;
    active: boolean;
}

export type LaravelPaginationMeta = {
    current_page: number;
    from: number;
    last_page: number;
    links: LaravelPaginationMetaLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
};

export type LaravelPagination<T> = {
    data: T[];
    links: LaravelPaginationLinks;
    meta: LaravelPaginationMeta;
}