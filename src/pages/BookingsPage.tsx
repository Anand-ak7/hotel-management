import { useEffect, useMemo, useState } from "react";
import { FiEye, FiLogIn, FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import {
  Button,
  EmptyState,
  IconButton,
  LoadingSpinner,
  Modal,
  SearchBar,
  StatusChip,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/api";
import { hotelService } from "../services/hotel.service";
import type { Booking } from "../types";
import { money } from "../utils/format";

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { showToast } = useToast();
  useEffect(() => {
    hotelService
      .bookings()
      .then(setBookings)
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  }, [showToast]);
  const filtered = useMemo(
    () =>
      bookings.filter((booking) =>
        [
          booking.guestName,
          booking.phone,
          booking.email,
          booking.room?.roomNumber,
          booking.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [bookings, search],
  );
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Bookings</h2>
          <p className="text-sm text-slate-500">
            Review guest stays and complete checkout.
          </p>
        </div>
        <Link to="/checkin" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <FiLogIn /> Add Booking
          </Button>
        </Link>
      </div>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search bookings"
      />
      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings found"
          message="Create a booking from the check-in screen."
        />
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {filtered.map((booking) => (
              <article key={booking.id} className="panel overflow-hidden p-3 sm:p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-extrabold text-royal-ink">
                      {booking.guestName}
                    </p>
                    <p className="text-sm text-slate-500">{booking.phone}</p>
                  </div>
                  <StatusChip status={booking.status} />
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-xl bg-royal-pearl p-3 text-sm min-[380px]:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Room
                    </p>
                    <p className="font-extrabold">
                      {booking.room?.roomNumber || booking.roomId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total
                    </p>
                    <p className="font-extrabold">
                      {money(booking.totalAmount)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Stay
                    </p>
                    <p className="font-semibold">
                      {booking.checkInDate} to {booking.expectedCheckOutDate}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <FiEye /> View Details
                </Button>
                {booking.status === "CHECKED_IN" && (
                  <Link to={"/checkout/" + booking.id}>
                    <Button className="mt-4 w-full">
                      <FiLogOut /> Check Out
                    </Button>
                  </Link>
                )}
              </article>
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable
              rows={filtered}
              getKey={(row) => row.id}
              columns={[
                {
                  key: "guest",
                  header: "Guest",
                  sortable: true,
                  render: (row) => (
                    <div>
                      <p className="font-bold">{row.guestName}</p>
                      <p className="text-xs text-slate-500">{row.phone}</p>
                    </div>
                  ),
                  sortValue: (row) => row.guestName,
                },
                {
                  key: "room",
                  header: "Room",
                  sortable: true,
                  render: (row) => row.room?.roomNumber || row.roomId,
                  sortValue: (row) => row.room?.roomNumber || row.roomId,
                },
                {
                  key: "dates",
                  header: "Stay Dates",
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
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <IconButton
                        label="View booking"
                        onClick={() => setSelectedBooking(row)}
                      >
                        <FiEye />
                      </IconButton>
                      {row.status === "CHECKED_IN" && (
                        <Link to={"/checkout/" + row.id}>
                          <IconButton label="Check out">
                            <FiLogOut />
                          </IconButton>
                        </Link>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
      <Modal
        title="Booking Details"
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      >
        {selectedBooking && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl bg-royal-pearl p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xl font-extrabold text-royal-ink">
                  {selectedBooking.guestName}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {selectedBooking.phone}
                </p>
                {selectedBooking.email && (
                  <p className="text-sm font-semibold text-slate-500">
                    {selectedBooking.email}
                  </p>
                )}
              </div>
              <StatusChip status={selectedBooking.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail
                label="Room"
                value={
                  selectedBooking.room?.roomNumber || selectedBooking.roomId
                }
              />
              <Detail
                label="Room Type"
                value={selectedBooking.room?.roomType || "-"}
              />
              <Detail label="ID Proof" value={selectedBooking.idProofNumber} />
              <Detail label="Check-In" value={selectedBooking.checkInDate} />
              <Detail
                label="Expected Check-Out"
                value={selectedBooking.expectedCheckOutDate}
              />
              <Detail
                label="Actual Check-Out"
                value={selectedBooking.actualCheckOutDate || "-"}
              />
              <Detail
                label="Advance Amount"
                value={money(selectedBooking.advanceAmount)}
              />
              <Detail
                label="Total Amount"
                value={money(selectedBooking.totalAmount)}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </Button>
              {selectedBooking.status === "CHECKED_IN" && (
                <Link to={"/checkout/" + selectedBooking.id}>
                  <Button className="w-full sm:w-auto">
                    <FiLogOut /> Check Out
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-app-border bg-white p-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words font-extrabold text-royal-ink">{value}</p>
    </div>
  );
}
