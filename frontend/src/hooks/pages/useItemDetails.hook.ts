import { useToast } from "@/contexts/ToastContext";
import { ItemService } from "@/services/item.service";
import { handleAxiosError } from "@/utils/handleAxiosError.util";
import type { ItemDetailsResponse } from "@shared/dtos/item.dto";
import { updateUnitsSchema } from "@shared/schemas/item.schema";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const useItemDetails = () => {

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



  const handleAddNewItemUnitsAmount = async (): Promise<void> => {

    if (isUpdating || !item) return;

    const validation = updateUnitsSchema.safeParse({
      units: Number(itemNewUnitsAmountOnInput),
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

      if (!response.success) {
        throw new Error('Unable to update item units');
      }

      setItem(prev =>
        prev ? {
          ...prev,
          unitsLoggedUserHas: validation.data.units,
        } : null
      );

      setItemNewUnitsAmount(validation.data.units);
      setIsEditingUnits(false);

      showToast('SUCCESS', response.message);
    } catch (error: unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsUpdating(false);
    }
  };



  const handleOnBlurUnitsInput = () => {
    if (itemNewUnitsAmountOnInput === '') {
      setItemNewUnitsAmountOnInput(String(itemNewUnitsAmount));
    }
  };



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


  const isWoodCategory = item?.category === 'WOOD';

  return {
    hooks: {
      navigate,
    },

    states :{
      item,
      imageExpand,
      error,
      loading,
      itemNewUnitsAmount,
      isEditingUnits,
      itemNewUnitsAmountOnInput,
      isWoodCategory,
      isUpdating,

    },

    setters: {
      setItem,
      setError,
      setImageExpand,
      setIsEditingUnits,
      setItemNewUnitsAmount,
      setItemNewUnitsAmountOnInput,
    },

    handlers: {
      handleAddNewItemUnitsAmount,
      handleOnBlurUnitsInput,
    },
  }
}