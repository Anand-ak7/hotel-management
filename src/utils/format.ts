import type { BookingStatus, RoomStatus } from "../types";

export const money = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
export const todayIso = () => new Date().toISOString().slice(0, 10);
export const isToday = (date?: string | null) =>
  Boolean(date && date.slice(0, 10) === todayIso());
export const roomStatusLabel: Record<RoomStatus, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};
export const bookingStatusLabel: Record<BookingStatus, string> = {
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
};
export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
