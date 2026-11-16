import type { ItemResponse, UserItemResponse } from "@shared/dtos/item.dto";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useUpdateParams } from "../useUpdateParams.hook";
import type { ItemsAdvancedFilter } from "@shared/maps/filters/items/items.filter";
import type { ItemsCategory } from "@shared/maps/filters/items/itemCategory.map";
import type { ItemsState } from "@shared/maps/filters/items/itemState.map";
import { ItemService } from "@/services/item.service";
import { ITEMS_PER_PAGE } from "@/consts/itemsPerPage.const";
import { normalizeFilter } from "@/utils/normalizaFilter.util";
import { handleAxiosError } from "@/utils/handleAxiosError.util";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";

export const useContactItem = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [items, setItems] = useState<UserItemResponse[]>([]);

  const [pagination, setPagination] = useState<
    PaginatedResponse<ItemResponse>["pagination"] | null>(null)
  ;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { updateParams } = useUpdateParams(setSearchParams);

  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? 1);
  const contactName = searchParams.get('username') ?? '';

  const itemsAdvancedFilter = (searchParams.get('advancedFilter') ?? null) as ItemsAdvancedFilter | null;
  const itemsCategoryFilter =  (searchParams.get('category') ?? null) as ItemsCategory | null;
  const itemsStateFilter = (searchParams.get('state') ?? null) as ItemsState | null;



  const handleSearch = useCallback((value: string): void => {
    updateParams({
      search : value || null,
      page   : '1',
    });
  }, [updateParams]);



  const handleCategoryFilter = (filter: ItemsCategory): void => {
    updateParams({
      category : filter === '_' ? null : filter,
      page     : '1',
    });
  };



  const handleStateFilter = (filter: ItemsState): void => {
    updateParams({
      state : filter === '_' ? null : filter,
      page  : '1',
    });
  };



  const handleAdvancedFilter = (filter: ItemsAdvancedFilter): void => {
    updateParams({
      advancedFilter : filter === '_' ? null : filter,
      page           : '1',
    });
  };



  const handlePage = (newPage: number): void => {
    updateParams({
      page: String(newPage),
    });
  };



  useEffect(() => {

    const controller = new AbortController();

    (async (contactId : number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await ItemService.getContactItems(
          {
            page,
            limit          : ITEMS_PER_PAGE,
            search         : search || undefined,
            category       : normalizeFilter(itemsCategoryFilter),
            state          : normalizeFilter(itemsStateFilter),
            advancedFilter : normalizeFilter(itemsAdvancedFilter),
          }, 
          contactId,
          controller.signal,
        );

        setItems(result.items);
        setPagination(result.pagination);

      } catch (error:unknown) {
        if (!controller.signal.aborted) setError(handleAxiosError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })(Number(id));

    return () => controller.abort();

  }, [
    page,
    search,
    itemsCategoryFilter,
    itemsStateFilter,
    itemsAdvancedFilter,
  ]);



  return {
    hooks: {
      navigate,
    },

    states: {
      contactName,
      search,
      itemsAdvancedFilter,
      itemsCategoryFilter,
      itemsStateFilter,
      loading,
      error,
      items,
      pagination,
      page,
    },
        
    handlers: {
      handlePage,
      handleAdvancedFilter,
      handleSearch,
      handleStateFilter,
      handleCategoryFilter,
    }
  }
}