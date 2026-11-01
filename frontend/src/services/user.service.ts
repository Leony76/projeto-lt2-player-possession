import { api } from "@/lib/api";

export class UserService {

  public static async updateProfileImage() {
    const { data } = await api.post('');
  }
}