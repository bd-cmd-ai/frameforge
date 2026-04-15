import type { OpeningHour } from "@radar-domace/types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatWeekdayLabel = (dayOfWeek: number) => weekdayLabels[dayOfWeek] ?? `Day ${dayOfWeek}`;

export const getOpenStatusLabel = (hours: OpeningHour[]) => {
  const now = new Date();
  const day = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = hours.find((entry) => entry.dayOfWeek === day);

  if (!today || today.isClosed || !today.opensAt || !today.closesAt) {
    return "Closed today";
  }

  const opensAt = toMinutes(today.opensAt);
  const closesAt = toMinutes(today.closesAt);

  if (currentMinutes >= opensAt && currentMinutes <= closesAt) {
    return `Open now • until ${today.closesAt}`;
  }

  if (currentMinutes < opensAt) {
    return `Opens at ${today.opensAt}`;
  }

  return "Closed for today";
};
