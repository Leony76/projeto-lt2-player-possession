import axios from "axios";

export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data: unknown = error.response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }

      return `Request failed with status ${error.response.status}.`;
    }

    if (error.request) {
      return "The server did not respond. Check your connection.";
    }

    return error.message || "Failed to prepare the request.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};
