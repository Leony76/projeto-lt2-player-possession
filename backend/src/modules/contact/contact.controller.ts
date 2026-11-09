import { GetContactsQuery } from "@shared/schemas/contact.schema.js";
import { Request, Response } from "express";
import { ContactService } from "./contact.service.js";
import { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto.js";
import { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter.js";

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
        onlyMyContacts: query.onlyMyContacts,
        ...(query.relationStatus && { relationStatus: query.relationStatus }),
      },
    );

    return res.status(200).json(result);
  }

  

  public static async getContactsFromHome(
    req : Request,
    res : Response,
  ) {
    const userId = Number(req.authUserId);

    const result = await ContactService.getContactsFromHome(userId);

    return res.status(200).json(result);
  }



  public static async getContactDetails(
    req : Request,
    res : Response,
  ) {
    const contactId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ContactService.getContactDetails(contactId, userId);

    return res.status(200).json(result);
  }



  public static async addContactRequest(
    req : Request,
    res : Response,
  ) {
    const contactId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ContactService.addContactRequest(contactId, userId);

    const response: SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}> = {
      body    : result,
      message : 'Add contact request sent',
      success : true,
    } 

    return res.status(200).json(response);
  }



  public static async acceptContactRequest(
    req : Request,
    res : Response,
  ) {
    const contactId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ContactService.acceptContactRequest(contactId, userId);

    const response: SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}> = {
      body    : result,
      message : 'Contact request accepted',
      success : true,
    } 

    return res.status(200).json(response);
  }



  public static async denyContactRequest(
    req : Request,
    res : Response,
  ) {
    const contactId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ContactService.denyContactRequest(contactId, userId);

    const response: SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}> = {
      body    : result,
      message : 'Contact request denied',
      success : true,
    } 

    return res.status(200).json(response);
  }



  public static async cancelContactPendingRequest(
    req : Request,
    res : Response,
  ) {
    const contactId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ContactService.cancelContactPendingRequest(contactId, userId);

    const response: SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}> = {
      body    : result,
      message : 'Contact request cancelled',
      success : true,
    } 

    return res.status(200).json(response);
  }



  public static async undoContactRequest(
    req : Request,
    res : Response,
  ) {
    const contactId = Number(req.params.id);
    const userId = Number(req.authUserId);

    const result = await ContactService.undoContactRequest(contactId, userId);

    const response: SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}> = {
      body    : result,
      message : 'Contact broken',
      success : true,
    } 

    return res.status(200).json(response);
  }
}