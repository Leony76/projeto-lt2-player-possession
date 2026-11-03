import type { LoggedUserMainInfosResponse } from "@shared/dtos/loggedUserMainInfos.dto.js";

export class AuthMapper {

  public static toPublicUser(
    user : LoggedUserMainInfosResponse
  ): LoggedUserMainInfosResponse {
    return {
      id              : user.id,
      name            : user.name,
      lumberBucks     : user.lumberBucks,
      profileImageURL : user.profileImageURL
    };
  }
}