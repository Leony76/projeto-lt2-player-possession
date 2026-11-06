import { ItemCategory, ItemState } from "@backend/generated/prisma/enums.js";
import { ItemDetailsResponse, UserItemResponse } from "@shared/dtos/item.dto.js";

export class ItemMapper {

  public static toItemDetailsResponse(
    data : {
      id          : number;
      category    : ItemCategory;
      state       : ItemState;
      description : string | null;
      name        : string;
      originalPrice            : number;
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
      unitsLoggedUserHas : users[0]?.units ?? 0,
    };
  }



  public static toUserItemsFromHomeResponse(
    data : {
      units: number;
      item: {
        id          : number;
        category    : ItemCategory;
        state       : ItemState;
        description : string | null;
        name        : string;
        originalPrice      : number;
        averageMarketPrice : number | null;
        imageURL           : string;
      };
    }[],
  ): UserItemResponse[] {
    return data.map(({ item, units }) => ({
      ...item,
      units,
    }));
  }



  public static toUserItemsResponse(
    data : {
      id           : number;
      category     : ItemCategory;
      state        : ItemState;
      description  : string | null;
      name               : string;
      originalPrice      : number;
      averageMarketPrice : number | null;
      imageURL           : string;
      users: {
        units : number;
      }[];
    }[],
  ): UserItemResponse[] {
    return data.map(({ users, ...item }) => ({
      ...item,
      units : users[0]?.units ?? 0,
    }));
  }
}