import { prisma } from "../../lib/prisma.js";

export class UserRepository {

  public static async editProfileImage(
    userId : number, 
    url    : string
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageURL: url,
      },
      select: {
        id              : true,
        name            : true,
        profileImageURL : true,
      }
    })
  }
}