export interface Category {
    id: string;
    name: string;
    slug : string;
    created_at: string;
}


export interface CreateCategory {
    name : string;
    slug : string;
}


export interface UpdateCategory {
    name : string
    id : string
    slug : string;
}