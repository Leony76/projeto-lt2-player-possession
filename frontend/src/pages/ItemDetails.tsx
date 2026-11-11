import React, { useEffect, useState } from 'react'
import styles from './css/ItemDetails.module.css'
import Layout from './Layout'
import PageTitle from '@/components/PageTitle'
import { BiDetail } from 'react-icons/bi'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import ImageExpand from '@/components/ImageExpand'
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util'
import { ITEMS_CATEGORY_MAP, type ItemsCategoryLabel } from '@shared/maps/filters/items/itemCategory.map'
import { ITEMS_STATE_MAP, type ItemsStateLabel } from '@shared/maps/filters/items/itemState.map'
import type { ItemDetailsResponse } from '@shared/dtos/item.dto'
import { ItemService } from '@/services/item.service'
import { handleAxiosError } from '@/utils/handleAxiosError.util'
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates'
import Button from '@/components/Button'
import { IoAddCircle } from 'react-icons/io5'
import IncrementDecrementButtons from '@/components/IncrementDecrementButtons'
import { useToast } from '@/contexts/ToastContext'
import { updateUnitsSchema } from '@shared/schemas/item.schema'

const ItemDetails = (): React.JSX.Element => {

  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [imageExpand, setImageExpand] = useState<boolean>(false);
  const [item, setItem] = useState<ItemDetailsResponse | null>(null);
  const [itemNewUnitsAmount, setItemNewUnitsAmount] = useState<number>(0);
  const [itemNewUnitsAmountOnInput, setItemNewUnitsAmountOnInput] = useState<string>("0");
  const [isEditingUnits, setIsEditingUnits] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    ( async() => {
      try {
        const item = await ItemService.getItemDetails(Number(id));

        setItemNewUnitsAmount(item.unitsLoggedUserHas);
        setItemNewUnitsAmountOnInput(String(itemNewUnitsAmount));
        setItem(item);
      } catch (error:unknown) {
        setError(handleAxiosError(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    setItemNewUnitsAmountOnInput(String(itemNewUnitsAmount));
  }, [itemNewUnitsAmount]);

  const handleAddNewItemUnitsAmount = async (): Promise<void> => {
    if (isUpdating || !item) return;

    const validation = updateUnitsSchema.safeParse({
      units: itemNewUnitsAmount,
    });

    if (!validation.success) {
      showToast('ERROR', validation.error.issues[0].message);
      return;
    }

    try {
      setIsUpdating(true);

      const response = await ItemService.updateUserItemUnits(
        item.id, 
        validation.data.units
      );

      if (!response.success) throw new Error('Unable to update item units');

      setItem(prev => prev 
        ? {
          ...prev,
          unitsLoggedUserHas: validation.data.units,
        } : null
      );

      setIsEditingUnits(false);
      showToast('SUCCESS', response.message);     
    } catch (error: unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const validateNewUnits = (units: number): boolean => {
    const result = updateUnitsSchema.safeParse({ units });

    if (!result.success) {
      showToast('ERROR', result.error.issues[0].message);
      return false;
    }

    return true;
  };

  const handleOnBlurUnitsInput = () => {
    if (itemNewUnitsAmountOnInput === '') {
      setItemNewUnitsAmountOnInput(String(itemNewUnitsAmount));
      return;
    }

    const amount = Number(itemNewUnitsAmountOnInput);

    if (!validateNewUnits(amount)) {
      setItemNewUnitsAmountOnInput(String(itemNewUnitsAmount));
      return;
    }

    setItemNewUnitsAmount(amount);
  };

  const ITEMS_DESCRIPTIVE_INFOS_MAP: Record<string, string | number> = {
    'Name:'                          : item?.name ?? 'Not available',
    'Category:'                      : ITEMS_CATEGORY_MAP[item?.category!] ?? 'Not available',
    'State:'                         : ITEMS_STATE_MAP[item?.state!] ?? 'Not available',
    'Original price:'                : item?.originalPrice ? item?.originalPrice < 0 ? 'Not available' : toLumberBucksFormat(item?.originalPrice) : 'Not available',
    'Average market price:'          : item?.averageMarketPrice ? toLumberBucksFormat(item?.averageMarketPrice) : 'Not available',
    'Average truckload price:'       : item?.averageTruckloadPrice ? toLumberBucksFormat(item?.averageTruckloadPrice) : 'Not available',
    'Average truckload price (1x1):' : item?.averageTruckloadPrice1x1 ?toLumberBucksFormat(item?.averageTruckloadPrice1x1) : 'Not available',
    'Release year:'                  : item?.releaseYear ?? 'Not available',
    'Units you have:'                : item?.unitsLoggedUserHas ?? 'Not available',
    'Description:'                   : `${item?.description ?? 'Not available'}`,
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

  const isWoodCategory = item?.category === 'WOOD';

  return (
    <Layout>
      <>
      {(imageExpand && item) &&
        <ImageExpand
          imageURL={item.imageURL}
          label={item.name}
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

        {(loading && !item) && <LoadingState label='item details'/> }

        {(!loading && error) && <ErrorState error={error}/>}

        {(!loading && !error && item) &&       
          <div className={styles.main_infos_container}>
            <figure 
            role='button'
            onClick={() => setImageExpand(true)}
            className={styles.item_image_container}
            >
              <img 
                className={styles.item_image}
                src={item.imageURL} 
                alt={item.name} 
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

                  if (!isWoodCategory && label === 'Average truckload price (1x1):') {
                    return null;
                  }

                  // if (
                    // (label === 'Average market price:' && item?.averageMarketPrice == null) ||
                    // (label === 'Release year:' && item?.releaseYear == null) ||
                    // (label === 'Description:' && !item?.description) ||
                    // (label === 'Average truckload price:' && item?.averageTruckloadPrice1x1 == null) ||
                    // (label === 'Average truckload price (1x1):' && item?.averageTruckloadPrice1x1 == null)
                    // (label === 'Original price:' && (item?.originalPrice == null || item?.originalPrice == -1))
                  // ) return null;     

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

              <div className={styles.add_item_container}>
                { itemNewUnitsAmount > 0 || isEditingUnits ? (
                  <div className={styles.new_item_units_container}>
                    <IncrementDecrementButtons
                      scale={1.2}
                      onDecrement={() => {
                        setItemNewUnitsAmount(prev => Math.max(0, prev - 1));
                        setIsEditingUnits(true);
                      }}
                      onIncrement={() => {
                        setIsEditingUnits(true);
                        setItemNewUnitsAmount(prev =>
                          Math.min(2147483647, prev + 1)
                        );
                      }}
                    />

                    {isEditingUnits && (
                      <>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={itemNewUnitsAmountOnInput}
                        onBlur={handleOnBlurUnitsInput}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setItemNewUnitsAmountOnInput(e.target.value);
                          }
                        }}
                      />

                      <Button
                        buttonStyle='DEFAULT'
                        label={isUpdating ? 'Submitting...' : 'Submit'}
                        loading={isUpdating}
                        onClick={handleAddNewItemUnitsAmount}
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
                      setIsEditingUnits(true);
                      setItemNewUnitsAmount(prev =>
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

        {(!loading && !error && !item) && <NotFoundState label='item details'/>}
      </div>
      </>
    </Layout>
  )
}

export default ItemDetails