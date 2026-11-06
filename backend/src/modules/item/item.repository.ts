import { prisma } from "@backend/lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { GetItemsFilters } from "@shared/maps/filters/items/getItems.type.js";


export class ItemRepository {
  
  public static async get(
    page    : number,
    limit   : number,
    filters : GetItemsFilters,
  ) {

    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      ...(filters.search && {
        OR: [
          {
            name: {
              contains : filters.search,
              mode     : "insensitive",
            },
          },
          {
            description: {
              contains : filters.search,
              mode     : "insensitive",
            },
          },
        ],
      }),

      ...(filters.category && {
        category: filters.category,
      }),

      ...(filters.state && {
        state: filters.state,
      }),
    };

    const orderBy: Prisma.ItemOrderByWithRelationInput[] = [];

    switch (filters.advancedFilter) {

      case "AZ_NAME":
        orderBy.push({ name: "asc" });
        break;

      case "ZA_NAME":
        orderBy.push({ name: "desc" });
        break;

      case "MOST_RECENTS":
        orderBy.push({ createdAt: "desc" });
        break;

      case "LESS_RECENTS":
        orderBy.push({ createdAt: "asc" });
        break;

      case "HIGHEST_ORIGINAL_PRICE":
        orderBy.push({ originalPrice: "desc" });
        break;

      case "LOWEST_ORIGINAL_PRICE":
        orderBy.push({ originalPrice: "asc" });
        break;

      case "HIGHEST_MARKET_PRICE":
        orderBy.push({
          averageMarketPrice: {
            sort: "desc",
            nulls: "last",
          },
        });
        break;

      case "LOWEST_MARKET_PRICE":
        orderBy.push({
          averageMarketPrice: {
            sort: "asc",
            nulls: "last",
          },
        });
        break;

      default:
        orderBy.push({ name: "asc" });
        break;
    }

    orderBy.push({ id: "asc" });

    const [items, totalItems] = await prisma.$transaction([

      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id                 : true,
          imageURL           : true,
          name               : true,
          category           : true,
          state              : true,
          description        : true,
          originalPrice      : true,
          averageMarketPrice : true,
        }
      }),

      prisma.item.count({
        where,
      }),

    ]);

    return {
      items,
      totalItems,
    };
  }



  public static async getItemDetails(
    itemId: number,
    userId: number,
  ) {

    return await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        imageURL: true,
        name: true,
        category: true,
        state: true,
        description: true,

        originalPrice: true,
        averageMarketPrice: true,
        averageTruckloadPrice: true,
        averageTruckloadPrice1x1: true,

        releaseYear: true,

        users: {
          where: {
            userId: userId,
          },
          select: {
            units: true,
          },
        },
      },
    });
  }



  public static async updateUserItemUnits(
    itemId : number,
    units  : number,
    userId : number,
  ) {
    return await prisma.userItem.upsert({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
      update : { units },
      create : {
        userId,
        itemId,
        units,
      },
      select: { 
        units: true,
        item: { select: { name: true }} 
      },
    });
  }



  public static async getUserItemsFromHome(
    userId : number,
  ) {
    return await prisma.userItem.findMany({
      where  : { 
        userId,
        units : { gt: 0 },
      },
      select : {
        units : true,
        item  : {
          select: {
            id       : true,
            imageURL : true,
            name     : true,
            category : true,
            state    : true,
            description        : true,
            averageMarketPrice : true,
            originalPrice      : true,
          },
        }
      },
      take: 6
    });
  }



  public static async getUserItems(
    userId  : number,
    page    : number,
    limit   : number,
    filters : GetItemsFilters,
  ) {

    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
       users: {
        some: {
          userId,
          units : { gt: 0 },
        },
      },

      ...(filters.search && {
        OR: [
          {
            name: {
              contains : filters.search,
              mode     : "insensitive",
            },
          },
          {
            description: {
              contains : filters.search,
              mode     : "insensitive",
            },
          },
        ],
      }),

      ...(filters.category && {
        category: filters.category,
      }),

      ...(filters.state && {
        state: filters.state,
      }),
    };

    const orderBy: Prisma.ItemOrderByWithRelationInput[] = [];

    switch (filters.advancedFilter) {

      case "AZ_NAME":
        orderBy.push({ name: "asc" });
        break;

      case "ZA_NAME":
        orderBy.push({ name: "desc" });
        break;

      case "MOST_RECENTS":
        orderBy.push({ createdAt: "desc" });
        break;

      case "LESS_RECENTS":
        orderBy.push({ createdAt: "asc" });
        break;

      case "HIGHEST_ORIGINAL_PRICE":
        orderBy.push({ originalPrice: "desc" });
        break;

      case "LOWEST_ORIGINAL_PRICE":
        orderBy.push({ originalPrice: "asc" });
        break;

      case "HIGHEST_MARKET_PRICE":
        orderBy.push({
          averageMarketPrice: {
            sort: "desc",
            nulls: "last",
          },
        });
        break;

      case "LOWEST_MARKET_PRICE":
        orderBy.push({
          averageMarketPrice: {
            sort: "asc",
            nulls: "last",
          },
        });
        break;

      default:
        orderBy.push({ name: "asc" });
        break;
    }

    orderBy.push({ id: "asc" });

    const [items, totalItems] = await prisma.$transaction([

      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id                 : true,
          imageURL           : true,
          name               : true,
          category           : true,
          state              : true,
          description        : true,
          originalPrice      : true,
          averageMarketPrice : true,
          users: {
            where  : { userId },
            select : { units: true },
          },
        }
      }),

      prisma.item.count({
        where,
      }),

    ]);

    return {
      items,
      totalItems,
    };
  }
}