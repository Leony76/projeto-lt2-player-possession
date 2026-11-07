import { GetContactsQuery } from "@shared/schemas/contact.schema.js";
import { Request, Response } from "express";
import { ContactService } from "./contact.service.js";

export class ContactController {

  public static async get(
    req : Request,
    res : Response,
  ) {
    const query = res.locals.validatedData as GetContactsQuery;
    const userId = Number(req.authUserId);

    const result = await ContactService.get(
      userId,
      query.page,
      query.limit,
      {
        search         : query.search,
        advancedFilter : query.advancedFilter,
      },
    );

    return res.status(200).json(result);
  }
}