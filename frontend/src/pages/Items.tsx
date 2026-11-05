import React, { useState } from 'react'
import styles from './css/Items.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { LuBoxes } from 'react-icons/lu';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import type { ItemsAdvancedFilter } from '@/maps/select/filters/items.filter';
import type { ItemsCategory } from '@/maps/select/filters/ItemCategory.map';
import type { ItemsState } from '@/maps/select/filters/ItemSubcategory.map';
import ItemNavCard from '@/components/ItemNavCard';
import imgPlaceholder2 from '@/assets/img/placeholder_2.png';

const Items = (): React.JSX.Element => {

  const [search, setSearch] = useState<string>("");

  const [itemsAdvancedFilter    , setItemsAdvancedFilter    ] = useState<ItemsAdvancedFilter | null>(null);
  const [itemsCategoryFilter    , setItemsCategoryFilter    ] = useState<ItemsCategory | null>(null);
  const [itemsSubcategoryFilter , setItemsSubcategoryFilter ] = useState<ItemsState | null>(null);
  
  return (
    <Layout tab='ITEMS'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <LuBoxes />}
          title='Items'
        />

        <div className={styles.toolbar_container}>
          <SearchBar
            placeholder="Search items..."
            debounceTime={400}
            onSearch={(value) => setSearch(value)}
            flex={4}
          />

          <Select
            selectConfig='ITEMS_SUBCATEGORY_FILTER'
            onSelect={(filter) => setItemsSubcategoryFilter(filter as ItemsState)}
            flex={0.67}
          />

          <Select
            selectConfig='ITEMS_CATEGORY_FILTER'
            onSelect={(filter) => setItemsCategoryFilter(filter as ItemsCategory)}
            flex={0.87}
          />

          <Select
            selectConfig='ITEMS_ADVANCED_FILTER'
            onSelect={(filter) => setItemsAdvancedFilter(filter as ItemsAdvancedFilter)}
            flex={1}
          />
        </div>

        <nav className={styles.nav}>
          <ul className={styles.ul}>
            {[0,1,2,3,4,5,6,7].map((index) => (
              <li 
              className={styles.li}
              key={index}
              >
                <ItemNavCard
                  id={12}
                  imageURL={imgPlaceholder2}
                  name={'Maria bonita de la aprma'}
                  category={'AXE'}
                  state={'GIFT'}
                  description={'"She\'s just bealtiful sadasd dxasd asdas"'}
                  originalPrice={69000}
                  marketPrice={690000}
                  units={1}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Layout>
  )
}

export default Items