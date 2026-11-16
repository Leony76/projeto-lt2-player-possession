import styles from './css/ItemDetails.module.css'
import PageTitle from '@/components/PageTitle'
import { BiDetail } from 'react-icons/bi'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import ImageExpand from '@/components/ImageExpand'
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util'
import { ITEMS_CATEGORY_MAP, type ItemsCategoryLabel } from '@shared/maps/filters/items/itemCategory.map'
import { ITEMS_STATE_MAP, type ItemsStateLabel } from '@shared/maps/filters/items/itemState.map'
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates'
import Button from '@/components/Button'
import { IoAddCircle } from 'react-icons/io5'
import IncrementDecrementButtons from '@/components/IncrementDecrementButtons'
import { useItemDetails } from '@/hooks/pages/useItemDetails.hook'

const ItemDetails = (): React.JSX.Element => {

  const { states, hooks, setters, handlers } = useItemDetails();

  const ITEMS_DESCRIPTIVE_INFOS_MAP: Record<string, string | number> = {
    'Name:'                          : states.item?.name ?? 'Not available',
    'Category:'                      : ITEMS_CATEGORY_MAP[states.item?.category!] ?? 'Not available',
    'State:'                         : ITEMS_STATE_MAP[states.item?.state!] ?? 'Not available',
    'Original price:'                : states.item?.originalPrice ? states.item?.originalPrice < 0 ? 'Not available' : toLumberBucksFormat(states.item?.originalPrice) : 'Not available',
    'Average market price:'          : states.item?.averageMarketPrice ? toLumberBucksFormat(states.item?.averageMarketPrice) : 'Not available',
    'Average truckload price:'       : states.item?.averageTruckloadPrice ? states.item?.averageTruckloadPrice < 0 ? 'Not available' : toLumberBucksFormat(states.item?.averageTruckloadPrice) : 'Not available',
    'Average truckload price (1x1):' : states.item?.averageTruckloadPrice1x1 ?toLumberBucksFormat(states.item?.averageTruckloadPrice1x1) : 'Not available',
    'Release year:'                  : states.item?.releaseYear ?? 'Not available',
    'Units you have:'                : states.item?.unitsLoggedUserHas ?? 'Not available',
    'Description:'                   : `${states.item?.description ?? 'Not available'}`,
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
    'Sawmill'       : styles.sawmill,
  };

  const tagColorByState: Record<Exclude<ItemsStateLabel, 'State'>, string> = {
    Boxed : styles.boxed,
    Gift  : styles.gift,
    Loose : styles.loose,
  };

  return (
    <>
    {(states.imageExpand && states.item) &&
      <ImageExpand
        imageURL={states.item.imageURL}
        label={states.item.name}
        onClick={() => setters.setImageExpand(false)}
      />
    }

    <div className={styles.container}>
      <div className={styles.page_title_history_back_container}>
        <button 
        className={styles.history_back_button}
        onClick={() => hooks.navigate(-1)}>
          <FaArrowLeft />
        </button>

        <PageTitle
          title='Item Details'
          Icon={() => <BiDetail />}
        />
      </div>

      {(states.loading && !states.item) && <LoadingState label='item details'/> }

      {(!states.loading && states.error) && <ErrorState error={states.error}/>}

      {(!states.loading && !states.error && states.item) &&       
        <div className={styles.main_infos_container}>
          <figure 
          role='button'
          onClick={() => setters.setImageExpand(true)}
          className={styles.item_image_container}
          >
            <img 
              className={styles.item_image}
              src={states.item.imageURL} 
              alt={states.item.name} 
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

                if (!states.isWoodCategory && label === 'Average truckload price (1x1):') {
                  return null;
                }  

                return (
                  <div 
                  className={styles.item}
                  key={label}
                  >
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

            <div className={styles.add_item_container}>
              { states.itemNewUnitsAmount > 0 || states.isEditingUnits ? (
                <div className={styles.new_item_units_container}>
                  <IncrementDecrementButtons
                    scale={1.2}
                    canDecrement={states.itemNewUnitsAmount > 0}
                    onDecrement={() => {
                      setters.setItemNewUnitsAmount(prev => Math.max(0, prev - 1));
                      setters.setIsEditingUnits(true);
                    }}
                    canIncrement={states.itemNewUnitsAmount < 2147483647}
                    onIncrement={() => {
                      setters.setIsEditingUnits(true);
                      setters.setItemNewUnitsAmount(prev =>
                        Math.min(2147483647, prev + 1)
                      );
                    }}
                  />

                  {states.isEditingUnits && (
                    <>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={states.itemNewUnitsAmountOnInput}
                      onBlur={handlers.handleOnBlurUnitsInput}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          setters.setItemNewUnitsAmountOnInput(e.target.value);
                        }
                      }}
                    />

                    <Button
                      buttonStyle='DEFAULT'
                      label={states.isUpdating ? 'Submitting...' : 'Submit'}
                      loading={states.isUpdating}
                      onClick={handlers.handleAddNewItemUnitsAmount}
                      icon={() => <FaCheckCircle size={14} />}
                      iconPosition={{ bottom: '-3px' }}
                      padding={{
                        X : '20px',
                        Y : '4px'
                      }}
                      colors={{
                        background  : '#cdffba',
                        labelBorder : '#215f09'
                      }}
                    />
                    </>
                  )}
                </div>
              ) : (
                <Button
                  buttonStyle='DEFAULT'
                  icon={() => <IoAddCircle />}
                  label='Add Item'
                  onClick={() => {
                    setters.setIsEditingUnits(true);
                    setters.setItemNewUnitsAmount(prev =>
                      Math.min(2147483647, prev + 1)
                    );
                  }}
                  iconPosition={{
                    bottom: '-2.5px'
                  }}
                  padding={{
                    X: '20px',
                    Y: '5px'
                  }}
                  colors={{
                    background  : '#cdffba',
                    labelBorder : '#215f09'
                  }}
                />
              )}
            </div>
          </section>
        </div>
      }

      {(!states.loading && !states.error && !states.item) && <NotFoundState label='item details'/>}
    </div>
    </>
  )
}

export default ItemDetails