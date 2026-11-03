import type { LoggedUserMainInfosResponse } from "./loggedUserMainInfos.dto";

export type EditProfileImageRequest = {
  userId    : number;
  file?     : File | null;
  imageURL? : string | null;
};

export type EditProfileImageResponse = Omit<LoggedUserMainInfosResponse, 'lumberBucks'>;