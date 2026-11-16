import styles from './css/MyItems.module.css';
import animations from '@assets/css/Animations.module.css';
import PageTitle from '@/components/PageTitle';
import { FaBoxOpen } from 'react-icons/fa';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import ItemNavCard from '@/components/ItemNavCard';
import { LoadingState, ErrorState, NotFoundState } from '@/components/ListStates';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import type { ItemsCategory } from '@shared/maps/filters/items/itemCategory.map';
import type { ItemsAdvancedFilter } from '@shared/maps/filters/items/items.filter';
import type { ItemsState } from '@shared/maps/filters/items/itemState.map';
import { useMyItems } from '@/hooks/pages/useMyItems.hook';

const MyItems = (): React.JSX.Element => {

  const { handlers, states } = useMyItems();
  
  return (
    <div className={styles.container}>
      <PageTitle
        Icon={() => <FaBoxOpen />}
        title={`My Items (${states.totalItems})`}
      />

      <div className={styles.toolbar_container}>
        <SearchBar
          value={states.search}
          placeholder="Search item..."
          debounceTime={400}
          onSearch={handlers.handleSearch}
          flex={4}
        />

        <Select
          value={states.itemsStateFilter ?? '_'}
          selectConfig="ITEMS_STATE_FILTER"
          onSelect={(filter) => handlers.handleStateFilter(filter as ItemsState)}
          flex={0.67}
        />

        <Select
          value={states.itemsCategoryFilter ?? '_'}
          selectConfig="ITEMS_CATEGORY_FILTER"
          onSelect={(filter) => handlers.handleCategoryFilter(filter as ItemsCategory)}
          flex={0.87}
        />

        <Select
          value={states.itemsAdvancedFilter ?? '_'}
          selectConfig="ITEMS_ADVANCED_FILTER"
          onSelect={(filter) => handlers.handleAdvancedFilter(filter as ItemsAdvancedFilter)}
          flex={1}
        />
      </div>

      <nav className={styles.nav}>
        {states.loading && <LoadingState label='Items'/>}

        {(!states.loading && states.error) && <ErrorState error={states.error}/>}  

        {!states.loading && !states.error && (
          <ul className={styles.ul}>
            {states.items.map((item, index) => (
              <li
              key={item.id}
              className={`${styles.li} ${animations.fade_in}`}
              style={{ animationDelay: `${index * 80}ms` }}
              >
                <ItemNavCard 
                  page='HOME/USER_ITEMS'
                  { ...item } 
                />
              </li>
            ))}
          </ul>
        )}

        {(!states.loading && !states.error && states.items.length === 0) && <NotFoundState label='Items'/>}
      </nav>

      {states.pagination && states.pagination.totalPages > 1 && (
        <PaginationNavButtons
          hasPreviousPage={states.pagination.hasPreviousPage}
          hasNextPage={states.pagination.hasNextPage}
          loading={states.loading}
          page={states.page}
          totalPages={states.pagination.totalPages}
          setPage={handlers.handlePage}
        />
      )}  
    </div>
  )
}

export default MyItems