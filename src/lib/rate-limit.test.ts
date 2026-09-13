import { describe, expect, it } from "vitest";
import { getClientIp, rateLimitResponse } from "./rate-limit";

describe("getClientIp", () => {
  it("prefers the address supplied by the trusted reverse proxy", () => {
    const requestHeaders = new Headers({
      "x-real-ip": "203.0.113.14",
      "x-forwarded-for": "198.51.100.2, 203.0.113.14",
    });
    expect(getClientIp(requestHeaders)).toBe("203.0.113.14");
  });

  it("uses the last forwarded address when x-real-ip is unavailable", () => {
    const requestHeaders = new Headers({
      "x-forwarded-for": "198.51.100.2, 203.0.113.21",
    });
    expect(getClientIp(requestHeaders)).toBe("203.0.113.21");
  });

  it("does not trust malformed forwarded values", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "not-an-ip" }))).toBe(
      "unknown",
    );
  });
});

describe("rateLimitResponse", () => {
  it("returns a generic 429 response without exposing quota details", async () => {
    const response = rateLimitResponse({
      allowed: false,
      limit: 10,
      retryAfter: 900,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("900");
    expect(await response.json()).toEqual({
      error: "Too many requests. Please wait and try again.",
    });
  });
});
