import React from 'react'
import styles from './css/ItemNavCard.module.css';
import { ITEMS_CATEGORY_MAP, type ItemsCategory } from '@/maps/select/filters/ItemCategory.map';
import { ITEMS_STATE_MAP, type ItemsState } from '@/maps/select/filters/ItemSubcategory.map';
import { FaMinus, FaPlus, FaStamp } from "react-icons/fa";
import { SiCardmarket } from 'react-icons/si';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import { Link } from 'react-router-dom';
import { type UserItemResponse as Item } from '@shared/dtos/item.dto';

type Props = Item;

const ItemNavCard = (props:Props): React.JSX.Element => {

  const tagColorByCategory: Record<Exclude<ItemsCategory, '_'>, string> = {
    AXE           : styles.axe ,
    BALL          : styles.ball ,
    BOOK          : styles.book ,
    CANDY         : styles.candy ,
    CANDY_CANE    : styles.candy_cane ,
    FINE_ART      : styles.fine_art , 
    FOOD          : styles.food,
    GAME          : styles.game,
    HOME          : styles.home,
    MISCELLANEOUS : styles.miscellaneous,
    PUMPKIN       : styles.pumpkin,
    VEHICLE       : styles.vehicle,
    WOBBLE_BOBBLE : styles.wobble_bobble,
    CONVEYOR      : styles.conveyor,
    LOGIC         : styles.logic,
    WOOD          : styles.wood,
  };

  const tagColorByState: Record<Exclude<ItemsState, '_'>, string> = {
    BOXED : styles.boxed,
    GIFT  : styles.gift,
    LOOSE : styles.loose,
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

      <div className={styles.category_state_container}>
        <span 
        title='Category'
        className={`
          ${styles.category} 
          ${tagColorByCategory[props.category]}
        `}>
          { ITEMS_CATEGORY_MAP[props.category]}
        </span>

        <span 
        title='State'
        className={`
          ${styles.state} 
          ${tagColorByState[props.state]}
        `}>
          { ITEMS_STATE_MAP[props.state] }
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