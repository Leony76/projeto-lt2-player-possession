import type { LoggedUserMainInfos } from "../../dtos/loggedUserMainInfos.dto.js";
import { prisma } from "../../lib/prisma.js";

export class AuthRepository {
  
  public static async userExistsByName(name: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where  : { name },
      select : { id: true }, 
    });

    return user !== null; 
  }
  
  public static async findUserByName(name: string) {
    return prisma.user.findUnique({
      where: { name }
    });
  }

  public static async userExistsById(id: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where  : { id },
      select : { id: true }, 
    });

    return user !== null; 
  }
  
  public static async findUserById(id: number) {
    return prisma.user.findUnique({ where: { id } })
  }
  
  public static async create(name: string, passwordHash: string): Promise<LoggedUserMainInfos> {
    return prisma.user.create({
      data: { 
        name, 
        passwordHash, 
      },
      select: {
        id              : true,
        name            : true,
        profileImageURL : true,
        lumberBucks     : true,
      }
    });
  }
}