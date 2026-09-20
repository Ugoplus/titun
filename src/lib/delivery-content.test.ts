import { describe, expect, it } from "vitest";
import { defaultDeliveryContent, deliveryContentSchema } from "./delivery-content";

describe("delivery content", () => {
  it("accepts the complete default delivery information", () => {
    expect(deliveryContentSchema.parse(defaultDeliveryContent)).toEqual(defaultDeliveryContent);
  });

  it("requires at least one destination in each delivery section", () => {
    expect(() =>
      deliveryContentSchema.parse({
        ...defaultDeliveryContent,
        nigeriaRegions: [],
      }),
    ).toThrow();
  });

  it("rejects invalid destination identifiers", () => {
    expect(() =>
      deliveryContentSchema.parse({
        ...defaultDeliveryContent,
        internationalRegions: [
          { id: "<script>", name: "England", timeframe: "5–10 working days" },
        ],
      }),
    ).toThrow();
  });
});
