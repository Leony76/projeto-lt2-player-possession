import styles from './css/ContactItems.module.css';
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
import { FaArrowLeft } from 'react-icons/fa';
import { useContactItem } from '@/hooks/pages/useContactItems.hook';

const ContactItems = (): React.JSX.Element => {

  const { hooks, states, handlers } = useContactItem();

  return (
    <div className={styles.container}>
      <div className={styles.page_title_history_back_container}>
        <button 
        className={styles.history_back_button}
        onClick={() => hooks.navigate(-1)}>
          <FaArrowLeft />
        </button>

        <PageTitle
          Icon={() => <LuBoxes />}
          title={`${states.contactName ?? '?'}'s items`}
        />
      </div>

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
              className={`${styles.li} ${animations.fade_in}`}
              style={{ animationDelay: `${index * 80}ms` }}
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

export default ContactItems