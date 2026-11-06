import { prisma } from "@backend/lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { GetItemsFilters } from "@shared/filters/items/getItems.type.js";


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

    // Ordenação
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