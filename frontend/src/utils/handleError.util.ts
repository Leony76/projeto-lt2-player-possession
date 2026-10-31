import axios from "axios";

export const handleError = (error: unknown, defaultMessage = "An unexpected error occurred."): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to connect to the server.";
  }
  
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};