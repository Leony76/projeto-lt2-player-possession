import type { User } from "../generated/prisma/client.js";

export type LoggedUserMainInfos = Omit<User, 
  'passwordHash' | 'createdAt' | 'updatedAt'
>;