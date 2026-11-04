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



  public static async verifyUsernameAvailability(
    username: string,
  ) {
    return await prisma.user.findUnique({
      where  : { name: username },
      select : { name: true     },
    })
  }



  public static async editUsername(
    username : string,
    userId   : number,
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        name: username,
      },
      select: {
        name : true,
        id   : true,
      }
    })
  }



  public static async editLumberBucks(
    lumberBucks : number,
    userId      : number,
  ) {
    return await prisma.user.update({
      where : { id: userId        },
      data  : { lumberBucks       },
      select: { lumberBucks: true },
    })
  }



  public static async editPassword(
    passwordHash : string,
    userId       : number,
  ) {
    return await prisma.user.update({
      where : { id: userId        },
      data  : { passwordHash      },
      select: { id: true          },
    })
  }
}