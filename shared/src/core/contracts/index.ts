export interface BaseEntityContract {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginationContract {
  page: number;
  limit: number;
}
