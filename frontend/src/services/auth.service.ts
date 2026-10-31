import type { LoggedUserMainInfos } from "@/dtos/loggedUserMainInfos.dto";
import type { UserCredentials } from "@/dtos/userCredentials.dto";
import { api } from "@/lib/api";

export class AuthService {

  public static async signUp(credentials: UserCredentials) {
    const { data } = await api.post<{user: LoggedUserMainInfos}>(
      "/auth/sign-up",
      credentials
    );

    return data.user;
  }



  public static async signIn(credentials: UserCredentials) {
    const { data } = await api.post<{user: LoggedUserMainInfos}>(
      "/auth/sign-in",
      credentials
    );

    return data.user;
  }



  public static async me() {
    const { data } = await api.get<{ user: LoggedUserMainInfos }>(
      "/auth/me",
    );

    return data.user;
  }



  public static async signOut() {
    await api.post("/auth/sign-out")
  }
}