import type { Request, Response } from "express";
import { ItemService } from "./item.service.js";
import { GetItemsQuery } from "@shared/schemas/item.schema.js";
import { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto.js";
import { UpdateUserItemUnitsResponse } from "@shared/dtos/item.dto.js";

export class ItemController {
  
  public static async get(
    req : Request,
    res : Response,
  ) {
    const query = res.locals.validatedData as GetItemsQuery;

    const result = await ItemService.get(
      query.page,
      query.limit,
      {
        search         : query.search,
        category       : query.category,
        state          : query.state,
        advancedFilter : query.advancedFilter,
      },
    );

    return res.status(200).json(result);
  }



  public static async getContactItems(
    req : Request,
    res : Response,
  ) {
    const query = res.locals.validatedData as GetItemsQuery;
    const contactId = Number(req.params.id);

    const result = await ItemService.getContactItems(
      contactId,
      query.page,
      query.limit,
      {
        search         : query.search,
        category       : query.category,
        state          : query.state,
        advancedFilter : query.advancedFilter,
      },
    );

    return res.status(200).json(result);
  }



  public static async getItemDetails(
    req : Request,
    res : Response,
  ) {
    const itemId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ItemService.getItemDetails(itemId, userId);

    return res.status(200).json(result);
  }



  public static async updateUserItemUnits(
    req : Request,
    res : Response,
  ) {
    const itemId = Number(req.params.id);
    const units = Number(req.body.units);
    const userId = Number(req.authUserId);

    const result = await ItemService.updateUserItemUnits(itemId, units, userId);

    const response: SuccessfulOperationResponse<UpdateUserItemUnitsResponse> = {
      body    : result,
      message : `${result.name} units successfully updated`,
      success : true,
    };

    return res.status(200).json(response);
  }



  public static async getUserItemsFromHome(
    req : Request,
    res : Response,
  ) {
    const userId = Number(req.authUserId);

    const response = await ItemService.getUserItemsFromHome(userId);

    return res.status(200).json(response);
  }



  public static async getUserItems(
    req : Request,
    res : Response,
  ) {
    const userId = Number(req.authUserId);

    const query = res.locals.validatedData as GetItemsQuery;

    const result = await ItemService.getUserItems(
      userId,
      query.page,
      query.limit,
      {
        search         : query.search,
        category       : query.category,
        state          : query.state,
        advancedFilter : query.advancedFilter,
      },
    );

    return res.status(200).json(result);
  }
}