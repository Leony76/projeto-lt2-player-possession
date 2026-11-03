import type { LoggedUserMainInfosResponse } from "@shared/dtos/loggedUserMainInfos.dto";
import type { UserCredentials } from "@/types/userCredentials.type";
import { api } from "@/lib/api";

export class AuthService {

  public static async signUp(credentials: UserCredentials) {
    const { data } = await api.post<{user: LoggedUserMainInfosResponse}>(
      "/auth/sign-up",
      credentials
    );

    return data.user;
  }



  public static async signIn(credentials: UserCredentials) {
    const { data } = await api.post<{user: LoggedUserMainInfosResponse}>(
      "/auth/sign-in",
      credentials
    );

    return data.user;
  }



  public static async me() {
    const { data } = await api.get<{ user: LoggedUserMainInfosResponse }>(
      "/auth/me",
    );

    return data.user;
  }



  public static async signOut() {
    await api.post("/auth/sign-out")
  }
}