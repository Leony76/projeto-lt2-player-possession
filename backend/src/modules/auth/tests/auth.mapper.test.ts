import { describe, it, expect } from "vitest";
import { AuthMapper } from "../auth.mappers.js";

describe("AuthMapper", () => {

  it("should return only public user information", () => {
    const user = {
      id              : 1,
      name            : "Player123",
      lumberBucks     : 500,
      profileImageURL : "https://example.com/image.png",
    };

    const result = AuthMapper.toPublicUser(user);

    expect(result).toEqual({
      id              : 1,
      name            : "Player123",
      lumberBucks     : 500,
      profileImageURL : "https://example.com/image.png",
    });
  });
});