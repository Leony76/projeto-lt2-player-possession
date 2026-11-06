import React, { useState } from 'react'
import styles from './css/ItemDetails.module.css'
import Layout from './Layout'
import PageTitle from '@/components/PageTitle'
import { BiDetail } from 'react-icons/bi'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import ImageExpand from '@/components/ImageExpand'
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util'
import type { ItemsCategoryLabel } from '@shared/filters/items/itemCategory.map'
import type { ItemsStateLabel } from '@shared/filters/items/itemState.map'

const ItemDetails = (): React.JSX.Element => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [imageExpand, setImageExpand] = useState<boolean>(false); 

  const ITEMS_DESCRIPTIVE_INFOS_MAP: Record<string, string | number> = {
    'Name:'                    : 'Fire axe',
    'Category:'                : 'Candy',
    'State:'                   : 'Loose',
    'Original price:'          : toLumberBucksFormat(14000),
    'Average market price:'    : toLumberBucksFormat(35000),
    'Average truckload price:' : toLumberBucksFormat(3500000),
    'Average truckload price (1x1):' : toLumberBucksFormat(4500000),
    'Release year:'            : 2016,
    'Units you have:'          : 324,
    'Description:'             : `"Cut a little wood, cut a lot of wood. You're a lumber person, and you know how to get the job done."`,
  };

  const tagColorByCategory: Record<Exclude<ItemsCategoryLabel, 'Category'>, string> = {
    'Axe'           : styles.axe ,
    'Ball'          : styles.ball ,
    'Book'          : styles.book ,
    'Candy'         : styles.candy ,
    'Candy Cane'    : styles.candy_cane ,
    'Fine Art'      : styles.fine_art , 
    'Food'          : styles.food,
    'Game'          : styles.game,
    'Home'          : styles.home,
    'Miscellaneous' : styles.miscellaneous,
    'Pumpkin'       : styles.pumpkin,
    'Vehicle'       : styles.vehicle,
    'Wobble Bobble' : styles.wobble_bobble,
    'Conveyor'      : styles.conveyor,
    'Wood'          : styles.wood,
    'Logic'         : styles.logic,
  };

  const tagColorByState: Record<Exclude<ItemsStateLabel, 'State'>, string> = {
    Boxed : styles.boxed,
    Gift  : styles.gift,
    Loose : styles.loose,
  };

  return (
    <Layout>
      <>
      { imageExpand &&
        <ImageExpand
          imageURL='https://static.wikia.nocookie.net/lumber-tycoon-2/images/5/54/THUMBBOXfireaxe.png/revision/latest?cb=20220117183957'
          label='Fire axe'
          onClick={() => setImageExpand(false)}
        />
      }

      <div className={styles.container}>
        <div className={styles.page_title_history_back_container}>
          <button 
          className={styles.history_back_button}
          onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>

          <PageTitle
            title='Item Details'
            Icon={() => <BiDetail />}
          />
        </div>

        <div className={styles.main_infos_container}>
          <figure 
          role='button'
          onClick={() => setImageExpand(true)}
          className={styles.item_image_container}
          >
            <img 
              className={styles.item_image}
              src="https://static.wikia.nocookie.net/lumber-tycoon-2/images/5/54/THUMBBOXfireaxe.png/revision/latest?cb=20220117183957" 
              alt="placeholder" 
            />
          </figure>

          <section className={styles.item_descriptive_infos_container}>
            <dl>
              { Object.entries(ITEMS_DESCRIPTIVE_INFOS_MAP).map(([label, detail]) => {
                
                const moneyClassName = 
                  label === 'Original price:'          || 
                  label === 'Average market price:'    || 
                  label === 'Average truckload price:' || 
                  label === 'Average truckload price (1x1):'
                ;

                const stateCategoryClassName =
                  label === 'Category:'
                  ? `${tagColorByCategory[detail as Exclude<ItemsCategoryLabel, 'Category'>]} ${styles.category_state_tag}`
                  : label === 'State:'
                  ? `${tagColorByState[detail as Exclude<ItemsStateLabel, 'State'>]} ${styles.category_state_tag}`
                  : ''
                ;

                if (
                  label === 'Average truckload price (1x1):' &&
                  ITEMS_DESCRIPTIVE_INFOS_MAP['Category:'] !== 'Wood'
                ) return null;          

                return (
                  <div className={styles.item}>
                    <dt>
                      { label }
                    </dt>
                    
                    <dd 
                    data-money={ moneyClassName }
                    data-description={label === 'Description:'}
                    data-release-year={label === 'Release year:'}
                    data-units-user-has={label === 'Units you have:'}
                    className={ stateCategoryClassName }
                    >
                      { detail }
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        </div>
      </div>
      </>
    </Layout>
  )
}

export default ItemDetails