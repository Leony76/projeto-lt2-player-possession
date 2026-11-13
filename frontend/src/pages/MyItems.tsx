import React, { useCallback, useEffect, useState } from 'react'
import styles from './css/MyItems.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { FaBoxOpen } from 'react-icons/fa';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import ItemNavCard from '@/components/ItemNavCard';
import { LoadingState, ErrorState, NotFoundState } from '@/components/ListStates';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import { ItemService } from '@/services/item.service';
import { normalizeFilter } from '@/utils/normalizaFilter.util';
import type { UserItemResponse as UserItems } from '@shared/dtos/item.dto';
import type { PaginatedResponse } from '@shared/dtos/pagination.dto';
import type { ItemsCategory } from '@shared/maps/filters/items/itemCategory.map';
import type { ItemsAdvancedFilter } from '@shared/maps/filters/items/items.filter';
import type { ItemsState } from '@shared/maps/filters/items/itemState.map';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { ITEMS_PER_PAGE } from '@/consts/itemsPerPage.const';
import { useSearchParams } from 'react-router-dom';
import { useUpdateParams } from '@/hooks/useUpdateParams.hook';

const MyItems = (): React.JSX.Element => {

  const [items, setItems] = useState<UserItems[]>([]);
  
  const [pagination, setPagination] = useState<
    PaginatedResponse<UserItems>["pagination"] | null>(null)
  ;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { updateParams } = useUpdateParams(setSearchParams);

  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const itemsAdvancedFilter = (searchParams.get('advancedFilter') ?? null) as ItemsAdvancedFilter | null;
  const itemsCategoryFilter =  (searchParams.get('category') ?? null) as ItemsCategory | null;
  const itemsStateFilter = (searchParams.get('state') ?? null) as ItemsState | null;

  useEffect(() => {

    const controller = new AbortController();

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await ItemService.getUserItems({
          page,
          limit          : ITEMS_PER_PAGE,
          search         : search || undefined,
          category       : normalizeFilter(itemsCategoryFilter),
          state          : normalizeFilter(itemsStateFilter),
          advancedFilter : normalizeFilter(itemsAdvancedFilter),
        }, controller.signal);

        setItems(result.items);
        setPagination(result.pagination);

      } catch (error:unknown) {
        if (!controller.signal.aborted) setError(handleAxiosError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadItems();

    return () => controller.abort();

  }, [
    page,
    search,
    itemsCategoryFilter,
    itemsStateFilter,
    itemsAdvancedFilter,
  ]);

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
  
  return (
    <Layout tab='MY_ITEMS'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaBoxOpen />}
          title='My Items'
        />

        <div className={styles.toolbar_container}>
          <SearchBar
            value={search}
            placeholder="Search item..."
            debounceTime={400}
            onSearch={handleSearch}
            flex={4}
          />

          <Select
            value={itemsStateFilter ?? '_'}
            selectConfig="ITEMS_STATE_FILTER"
            onSelect={(filter) => handleStateFilter(filter as ItemsState)}
            flex={0.67}
          />

          <Select
            value={itemsCategoryFilter ?? '_'}
            selectConfig="ITEMS_CATEGORY_FILTER"
            onSelect={(filter) => handleCategoryFilter(filter as ItemsCategory)}
            flex={0.87}
          />

          <Select
            value={itemsAdvancedFilter ?? '_'}
            selectConfig="ITEMS_ADVANCED_FILTER"
            onSelect={(filter) => handleAdvancedFilter(filter as ItemsAdvancedFilter)}
            flex={1}
          />
        </div>

        <nav className={styles.nav}>
          {loading && <LoadingState label='Items'/>}

          {(!loading && error) && <ErrorState error={error}/>}  

          {!loading && !error && (
            <ul className={styles.ul}>
              {items.map((item) => (
                <li
                className={styles.li}
                key={item.id}
                >
                  <ItemNavCard 
                    page='HOME/USER_ITEMS'
                    { ...item } 
                  />
                </li>
              ))}
            </ul>
          )}

          {(!loading && !error && items.length === 0) && <NotFoundState label='Items'/>}
        </nav>

        {pagination && pagination.totalPages > 1 && (
          <PaginationNavButtons
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            loading={loading}
            page={page}
            totalPages={pagination.totalPages}
            setPage={handlePage}
          />
        )}  
      </div>
    </Layout>
  )
}

export default MyItems