import React from 'react'
import styles from './css/ItemNavCard.module.css';
import type { ItemsCategory } from '@/types/ItemsCategory';
import type { ItemsSubcategory } from '@/types/ItemsSubcategory';
import { ITEMS_CATEGORY_MAP } from '@/maps/ItemCategoryMap';
import { ITEM_SUBCATEGORY_MAP } from '@/maps/ItemSubcategoryMap';
import { FaMinus, FaPlus, FaStamp } from "react-icons/fa";
import { SiCardmarket } from 'react-icons/si';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat';
import { Link } from 'react-router-dom';

type Props = {
  readonly   id : number; 
  imageURL      : string;
  name          : string;
  category      : ItemsCategory;
  subcategory   : ItemsSubcategory;
  description   : string;
  originalPrice : number;
  marketPrice   : number;
  units         : number;
};

const ItemNavCard = (props:Props): React.JSX.Element => {

  const tagColorByCategory: Record<ItemsCategory, string> = {
    LOOSE    : styles.loose,
    PLACEBLE : styles.placeble,
  };

  const tagColorBySubcategory: Record<ItemsSubcategory, string> = {
    AXE   : styles.axe,
    EVENT : styles.event,
    LOGIC : styles.logic,
    MISC  : styles.misc,
    PLANK : styles.plank,
  };

  return (
    <div className={styles.container}>
      <figure className={styles.image_container} title='Image'>
        <img 
          className={styles.image}
          src={props.imageURL} 
          alt={props.name} 
        />
      </figure>

      <Link 
      to={`/item/${props.id}`}
      className={styles.link_name}
      title='Name - See more details'
      >
        <h3 className={styles.name}>
          { props.name }
        </h3>
      </Link>

      <div className={styles.category_subcategory_container}>
        <span 
        title='Category'
        className={`
          ${styles.category} 
          ${tagColorByCategory[props.category]}
        `}>
          { ITEMS_CATEGORY_MAP[props.category] }
        </span>

        <span 
        title='Subcategory'
        className={`
          ${styles.subcategory} 
          ${tagColorBySubcategory[props.subcategory]}
        `}>
          { ITEM_SUBCATEGORY_MAP[props.subcategory] }
        </span>
      </div>

      <p className={styles.description} title='Description'>
        { props.description }
      </p>

      <div className={styles.original_market_price_container} title='Original Price'>
        <span className={styles.original_price}>
          <span className={styles.icon}>
            <FaStamp size={14}/>
          </span>

          { toLumberBucksFormat(props.originalPrice) }
        </span>

        <span className={styles.market_price} title='Market Price'>
          <span className={styles.icon}>
            <SiCardmarket size={14}/>
          </span>

          { toLumberBucksFormat(props.marketPrice) }
        </span>
      </div>
      
      <div className={styles.units_increment_decrement_container}>
        <p className={styles.units} title='Units'>
          { props.units }x
        </p>

        <div className={styles.increment_decrement_container}>
          <button className={styles.increment} title='Add Unit'>
            <FaPlus />
          </button>
          
          {'|'}

          <button className={styles.decrement} title='Subtract Unit'>
            <FaMinus />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemNavCard