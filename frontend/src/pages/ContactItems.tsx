import React, { useCallback, useEffect, useState } from 'react'
import styles from './css/ContactItems.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { LuBoxes } from 'react-icons/lu';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import type { ItemsAdvancedFilter } from '@shared/maps/filters/items/items.filter';
import type { ItemsCategory } from '@shared/maps/filters/items/itemCategory.map';
import type { ItemsState } from '@shared/maps/filters/items/itemState.map';
import ItemNavCard from '@/components/ItemNavCard';
import type { ItemResponse, UserItemResponse } from '@shared/dtos/item.dto';
import type { PaginatedResponse } from '@shared/dtos/pagination.dto';
import { ItemService } from '@/services/item.service';
import { normalizeFilter } from '@/utils/normalizaFilter.util';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { ITEMS_PER_PAGE } from '@/consts/itemsPerPage.const';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useUpdateParams } from '@/hooks/useUpdateParams.hook';

const ContactItems = (): React.JSX.Element => {

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
    <Layout>
      <div className={styles.container}>
        <div className={styles.page_title_history_back_container}>
          <button 
          className={styles.history_back_button}
          onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>

          <PageTitle
            Icon={() => <LuBoxes />}
            title={`${contactName ?? '?'}'s items`}
          />
        </div>

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

export default ContactItems