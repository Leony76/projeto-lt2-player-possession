import type { Request, Response } from "express";
import { ItemService } from "./item.service.js";
import { ItemCategory, ItemState } from "@backend/generated/prisma/enums.js";
import { ITEMS_ADVANCED_FILTER_MAP_KEYS, type ItemsAdvancedFilter } from "@shared/filters/items/items.filter.js";

export class ItemController {
  
  public static async get(
    req: Request,
    res: Response,
  ): Promise<void> {

    const page = Number(req.query["page"] ?? 1);
    const limit = Number(req.query["limit"] ?? 30);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1
    ) {
      res.status(400).json({
        message: "Invalid pagination parameters.",
      });

      return;
    }

    const search = String(req.query["search"] ?? "").trim();

    const category = req.query["category"]
      ? String(req.query["category"])
      : undefined;

    const state = req.query["state"]
      ? String(req.query["state"])
      : undefined;

    const advancedFilter = req.query["advancedFilter"]
      ? String(req.query["advancedFilter"])
      : undefined;

    if (
      category &&
      !Object.values(ItemCategory).includes(category as ItemCategory)
    ) {
      res.status(400).json({ message: "Invalid category." });

      return;
    }

    if (
      state &&
      !Object.values(ItemState).includes(state as ItemState)
    ) {
      res.status(400).json({ message: "Invalid state." });

      return;
    }

    if (
      advancedFilter &&
      !ITEMS_ADVANCED_FILTER_MAP_KEYS.includes(
        advancedFilter as typeof ITEMS_ADVANCED_FILTER_MAP_KEYS[number],
      )
    ) {
      res.status(400).json({ message: "Invalid advanced filter." });

      return;
    }

    const result = await ItemService.get(page, limit, {
      search         : search || undefined,
      category       : category as ItemCategory | undefined,
      state          : state as ItemState       | undefined,
      advancedFilter : advancedFilter as  Exclude<ItemsAdvancedFilter, '_'> | undefined,
    });

    res.status(200).json(result);
  }
}