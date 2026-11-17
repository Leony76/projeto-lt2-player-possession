import styles from './css/Items.module.css';
import animations from '@assets/css/Animations.module.css';
import PageTitle from '@/components/PageTitle';
import { LuBoxes } from 'react-icons/lu';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import type { ItemsAdvancedFilter } from '@shared/maps/filters/items/items.filter';
import type { ItemsCategory } from '@shared/maps/filters/items/itemCategory.map';
import type { ItemsState } from '@shared/maps/filters/items/itemState.map';
import ItemNavCard from '@/components/ItemNavCard';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import { useItems } from '@/hooks/pages/useItems.hook';

const Items = (): React.JSX.Element => {

  const { states, handlers } = useItems();

  return (
    <div className={styles.container}>
      <PageTitle
        Icon={() => <LuBoxes />}
        title='Items'
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
          selectConfig="ITEMS_STATE_FILTER"
          value={states.itemsStateFilter ?? '_'}
          onSelect={(filter) => handlers.handleStateFilter(filter as ItemsState)}
          flex={0.67}
        />

        <Select
          selectConfig="ITEMS_CATEGORY_FILTER"
          value={states.itemsCategoryFilter ?? '_'}
          onSelect={(filter) => handlers.handleCategoryFilter(filter as ItemsCategory)}
          flex={0.87}
        />

        <Select
          selectConfig="ITEMS_ADVANCED_FILTER"
          value={states.itemsAdvancedFilter ?? '_'}
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
              className={`${styles.li} ${animations.fade_in}`}
              style={{ animationDelay: `${index * 80}ms` }}
              key={item.id}
              >
                <ItemNavCard 
                  page='ITEMS'
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

export default Items