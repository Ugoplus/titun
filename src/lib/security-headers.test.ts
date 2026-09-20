import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers";

describe("security headers", () => {
  it("blocks third-party scripts and analytics connections by default", () => {
    const csp = securityHeaders.find((header) => header.key === "Content-Security-Policy")?.value;
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("cloudflareinsights.com");
  });
});
