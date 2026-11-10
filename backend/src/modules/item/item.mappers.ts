import { ItemCategory, ItemState } from "@backend/generated/prisma/enums.js";
import { ItemDetailsResponse, UserItemFromHomeResponse, UserItemResponse } from "@shared/dtos/item.dto.js";

export class ItemMapper {

  public static toItemDetailsResponse(
    data : {
      id          : number;
      category    : ItemCategory;
      state       : ItemState;
      description : string | null;
      name        : string;
      originalPrice            : number | null;
      averageMarketPrice       : number | null;
      averageTruckloadPrice    : number;
      averageTruckloadPrice1x1 : number | null;
      releaseYear : number | null;
      imageURL    : string;
      users : {
        units: number;
      }[];
    }
  ): ItemDetailsResponse {

     const { users, ...item } = data;

    return {
      ...item,
      originalPrice: item.originalPrice ?? -1,
      unitsLoggedUserHas : users[0]?.units ?? 0,
    };
  }



  public static toUserItemsFromHomeResponse(
    data: {
      items: {
        units : number;
        item  : {
          id          : number;
          category    : ItemCategory;
          state       : ItemState;
          description : string | null;
          name        : string;
          originalPrice      : number | null;
          averageMarketPrice : number | null;
          imageURL           : string;
        };
      }[];
      totalItems: number;
    },
  ): UserItemFromHomeResponse {
    return {
      items: data.items.map(({ item, units }) => ({
        ...item,
        originalPrice : item.originalPrice ?? -1,
        units,
      })),

      totalItems: data.totalItems,
    };
  }



  public static toUserItemsResponse(
    data : {
      id           : number;
      category     : ItemCategory;
      state        : ItemState;
      description  : string | null;
      name               : string;
      originalPrice      : number | null;
      averageMarketPrice : number | null;
      imageURL           : string;
      users: {
        units : number;
      }[];
    }[],
  ): UserItemResponse[] {
    return data.map(({ users, ...item }) => ({
      ...item,
      originalPrice : item.originalPrice ?? -1,
      units : users[0]?.units ?? 0,
    }));
  }
}