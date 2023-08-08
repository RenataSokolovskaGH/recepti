import { IAPIErrorSchema } from "../../../interfaces";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface APISuccessResponseSkeleton extends IAPIErrorSchema {
}

export interface PageInfoResponseSkeleton {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
}
