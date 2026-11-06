export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page            : number;
    limit           : number;
    totalItems      : number;
    totalPages      : number;
    hasNextPage     : boolean;
    hasPreviousPage : boolean;
  };
};

