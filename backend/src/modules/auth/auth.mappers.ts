import type { LoggedUserMainInfos } from "../../dtos/loggedUserMainInfos.dto.js";

export class AuthMapper {

  public static async toPublicUser(user: LoggedUserMainInfos): Promise<LoggedUserMainInfos> {
    return {
      id              : user.id,
      name            : user.name,
      lumberBucks     : user.lumberBucks,
      profileImageURL : user.profileImageURL
    };
  }
}