import { describe, expect, it } from "vitest";
import { filterEventsByStatus, getEventStatus } from "./events";

const now = new Date("2026-09-20T12:00:00.000Z");
const events = [
  { id: "past", startsAt: new Date("2026-09-19T12:00:00.000Z") },
  { id: "upcoming", startsAt: new Date("2026-09-21T12:00:00.000Z") },
];

describe("event archive status", () => {
  it("derives upcoming and past status from the event date", () => {
    expect(getEventStatus(events[0].startsAt, now)).toBe("past");
    expect(getEventStatus(events[1].startsAt, now)).toBe("upcoming");
  });

  it("shows every event by default", () => {
    expect(filterEventsByStatus(events, "all", now)).toEqual(events);
  });

  it("filters upcoming and past events without changing their order", () => {
    expect(filterEventsByStatus(events, "upcoming", now)).toEqual([events[1]]);
    expect(filterEventsByStatus(events, "past", now)).toEqual([events[0]]);
  });
});
