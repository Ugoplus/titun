export type EventArchiveFilter = "all" | "upcoming" | "past";

export const getEventStatus = (
  startsAt: Date,
  now: Date = new Date(),
): Exclude<EventArchiveFilter, "all"> =>
  startsAt.getTime() >= now.getTime() ? "upcoming" : "past";

export const filterEventsByStatus = <T extends { startsAt: Date }>(
  events: T[],
  filter: EventArchiveFilter,
  now: Date = new Date(),
) =>
  filter === "all"
    ? events
    : events.filter((event) => getEventStatus(event.startsAt, now) === filter);
