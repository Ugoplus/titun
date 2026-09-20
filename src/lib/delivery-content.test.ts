import { describe, expect, it } from "vitest";
import {
  defaultDeliveryContent,
  deliveryContentSchema,
  findDeliveryOption,
  getCheckoutDeliveryGroups,
} from "./delivery-content";

describe("delivery content", () => {
  it("accepts the complete default delivery information", () => {
    expect(deliveryContentSchema.parse(defaultDeliveryContent)).toEqual(defaultDeliveryContent);
  });

  it("provides priced checkout options grouped by destination", () => {
    const groups = getCheckoutDeliveryGroups(defaultDeliveryContent);

    expect(groups).toHaveLength(2);
    expect(groups[0].options[0]).toMatchObject({
      id: "lagos-island",
      price: 300_000,
    });
    expect(findDeliveryOption(defaultDeliveryContent, "england")).toMatchObject({
      name: "England",
      price: 2_500_000,
    });
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
          { id: "<script>", name: "England", timeframe: "5–10 working days", price: 2_500_000 },
        ],
      }),
    ).toThrow();
  });

  it("rejects zero prices and duplicate option identifiers", () => {
    expect(() =>
      deliveryContentSchema.parse({
        ...defaultDeliveryContent,
        nigeriaRegions: [
          { ...defaultDeliveryContent.nigeriaRegions[0], price: 0 },
        ],
      }),
    ).toThrow();

    expect(() =>
      deliveryContentSchema.parse({
        ...defaultDeliveryContent,
        internationalRegions: [
          { ...defaultDeliveryContent.internationalRegions[0], id: "lagos-island" },
        ],
      }),
    ).toThrow();
  });
});
