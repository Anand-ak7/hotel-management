import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiLogIn,
  FiPlus,
  FiTrendingUp,
  FiTool,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Button, LoadingSpinner, StatCard, StatusChip } from "../components/ui";
import { getErrorMessage } from "../services/api";
import { hotelService } from "../services/hotel.service";
import type { Booking, Room } from "../types";
import { cx, isToday, money } from "../utils/format";
import { useToast } from "../hooks/useToast";

export function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  useEffect(() => {
    Promise.all([hotelService.rooms(), hotelService.bookings()])
      .then(([roomData, bookingData]) => {
        setRooms(roomData);
        setBookings(bookingData);
      })
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  }, [showToast]);
  const stats = useMemo(
    () => ({
      total: rooms.length,
      available: rooms.filter((room) => room.status === "AVAILABLE").length,
      occupied: rooms.filter((room) => room.status === "OCCUPIED").length,
      maintenance: rooms.filter((room) => room.status === "MAINTENANCE").length,
      checkins: bookings.filter((booking) => isToday(booking.checkInDate))
        .length,
      checkouts: bookings.filter((booking) =>
        isToday(booking.actualCheckOutDate),
      ).length,
      revenue: bookings.reduce(
        (total, booking) => total + Number(booking.totalAmount || 0),
        0,
      ),
    }),
    [bookings, rooms],
  );
  const occupancyRate = stats.total
    ? Math.round((stats.occupied / stats.total) * 100)
    : 0;
  const recentBookings = bookings.slice(0, 6);
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="panel overflow-hidden">
        <div className="relative grid gap-5 overflow-hidden bg-gradient-to-br from-royal-navy via-royal-ink to-slate-950 p-4 text-white sm:p-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-royal-gold/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-60 w-60 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative">
            <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-4xl">
              Hotel Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Room availability, booking movement, and service readiness at a
              glance.
            </p>
            <div className="mt-5 grid gap-3 sm:flex sm:flex-row">
              <Link to="/checkin" className="w-full sm:w-auto">
                <Button className="w-full bg-white text-royal-navy hover:bg-royal-champagne sm:w-auto">
                  <FiLogIn /> New Check-In
                </Button>
              </Link>
              <Link to="/rooms" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full !border-white/15 !bg-white/10 !text-white hover:!bg-white/15 sm:w-auto"
                >
                  <FiPlus /> Manage Rooms
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-amber-50/90 shadow-royal backdrop-blur sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-100/70">
                  Occupancy
                </p>
              <p className="mt-1 text-3xl font-extrabold sm:text-4xl">{occupancyRate}%</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-royal-gold">
                <FiTrendingUp size={24} />
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-royal-gold to-emerald-400"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <HeroMetric label="Ready" value={stats.available} />
              <HeroMetric label="Occupied" value={stats.occupied} />
              <HeroMetric label="Care" value={stats.maintenance} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total Rooms" value={stats.total} icon={FiHome} />
        <StatCard
          label="Available Rooms"
          value={stats.available}
          icon={FiCheckCircle}
          tone="success"
        />
        <StatCard
          label="Occupied Rooms"
          value={stats.occupied}
          icon={FiClock}
          tone="primary"
        />
        <StatCard
          label="Maintenance"
          value={stats.maintenance}
          icon={FiTool}
          tone="warning"
        />
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <StatCard
          label="Today's Check-ins"
          value={stats.checkins}
          icon={FiCalendar}
          tone="success"
        />
        <StatCard
          label="Today's Check-outs"
          value={stats.checkouts}
          icon={FiCheckCircle}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-app-border bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-royal-ink">
                Recent Bookings
              </h3>
              <p className="text-sm text-slate-500">
                Latest guest movement across rooms
              </p>
            </div>
            <Link to="/bookings" className="text-sm font-bold text-primary">
              View all
            </Link>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-app-border bg-royal-pearl p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-royal-ink">
                      {booking.guestName}
                    </p>
                    <p className="text-sm font-semibold text-slate-500">
                      Room {booking.room?.roomNumber || booking.roomId}
                    </p>
                  </div>
                  <StatusChip status={booking.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">
                    {booking.checkInDate}
                  </span>
                  <span className="font-extrabold text-royal-ink">
                    {money(booking.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable
              rows={recentBookings}
              getKey={(row) => row.id}
              columns={[
                {
                  key: "guest",
                  header: "Guest",
                  sortable: true,
                  render: (row) => row.guestName,
                  sortValue: (row) => row.guestName,
                },
                {
                  key: "room",
                  header: "Room",
                  render: (row) => row.room?.roomNumber || row.roomId,
                },
                {
                  key: "dates",
                  header: "Dates",
                  render: (row) =>
                    row.checkInDate + " to " + row.expectedCheckOutDate,
                },
                {
                  key: "amount",
                  header: "Total",
                  sortable: true,
                  render: (row) => money(row.totalAmount),
                  sortValue: (row) => Number(row.totalAmount),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => <StatusChip status={row.status} />,
                },
              ]}
            />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="panel overflow-hidden p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-royal-gold">
              Today
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-royal-ink">
              Desk Activity
            </h3>
            <div className="mt-4 grid gap-3">
              <MiniMetric
                label="Check-ins"
                value={stats.checkins}
                icon={<FiCalendar />}
                tone="success"
              />
              <MiniMetric
                label="Check-outs"
                value={stats.checkouts}
                icon={<FiCheckCircle />}
                tone="warning"
              />
              <MiniMetric
                label="Booking value"
                value={money(stats.revenue)}
                icon={<FiTrendingUp />}
                tone="primary"
              />
            </div>
          </div>

          <div className="panel overflow-hidden p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-royal-gold">
              Room Mix
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-royal-ink">
              Availability Split
            </h3>
            <div className="mt-4 space-y-3">
              <StatusBar
                label="Available"
                value={stats.available}
                total={stats.total}
                className="bg-success"
              />
              <StatusBar
                label="Occupied"
                value={stats.occupied}
                total={stats.total}
                className="bg-primary"
              />
              <StatusBar
                label="Maintenance"
                value={stats.maintenance}
                total={stats.total}
                className="bg-warning"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-xs uppercase tracking-wide text-amber-100/70">
        {label}
      </p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "success" | "warning" | "primary";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            tone === "success" && "bg-green-50 text-success",
            tone === "warning" && "bg-amber-50 text-warning",
            tone === "primary" && "bg-blue-50 text-primary",
          )}
        >
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-lg font-extrabold text-royal-ink">{value}</span>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  className,
}: {
  label: string;
  value: number;
  total: number;
  className: string;
}) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-extrabold text-royal-ink">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cx("h-full rounded-full", className)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
