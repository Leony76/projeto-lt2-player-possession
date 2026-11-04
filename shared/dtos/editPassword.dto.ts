export type PasswordVerificationRequest = {
  password: string;
}

export type PasswordVerificationResponse = {
  success: boolean;
}

export type EditPasswordRequest = {
  newPassword: string;
}

export type EditPasswordResponse = {
  success: boolean;
}