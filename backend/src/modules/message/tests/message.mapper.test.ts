
import { describe, expect, it } from "vitest";

import { MessageMapper } from "../message.mapper.js";

describe("MessageMapper.toContactFormat", () => {
  it("should map contact fields to InitialChatContact", () => {
    const contact = {
      id: 10,
      name: "Player 1",
      profileImageURL: "https://example.com/profile.webp",
    };

    const result = MessageMapper.toContactFormat(contact);

    expect(result).toEqual({
      id: 10,
      username: "Player 1",
      profileImageURL: "https://example.com/profile.webp",
    });
  });

  it("should preserve null profileImageURL", () => {
    const contact = {
      id: 10,
      name: "Player 1",
      profileImageURL: null,
    };

    const result = MessageMapper.toContactFormat(contact);

    expect(result).toEqual({
      id: 10,
      username: "Player 1",
      profileImageURL: null,
    });
  });
});
