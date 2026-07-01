import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiCalendar, FiCreditCard, FiLogIn, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  Button,
  CustomSelect,
  Field,
  Input,
  LoadingSpinner,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/api";
import { hotelService } from "../services/hotel.service";
import type { Room } from "../types";
import { money, todayIso } from "../utils/format";

const schema = z.object({
  guestName: z.string().min(2, "Guest name is required"),
  phone: z.string().min(7, "Phone is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  idProofNumber: z.string().min(3, "ID proof is required"),
  roomId: z.coerce.number().min(1, "Select a room"),
  checkInDate: z.string().min(1, "Check-in date is required"),
  expectedCheckOutDate: z.string().min(1, "Expected checkout date is required"),
  advanceAmount: z.coerce.number().min(0, "Advance cannot be negative"),
  totalAmount: z.coerce.number().min(0, "Total cannot be negative"),
});
type CheckinInput = z.input<typeof schema>;
type CheckinForm = z.output<typeof schema>;

export function CheckinPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const form = useForm<CheckinInput, unknown, CheckinForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      guestName: "",
      phone: "",
      email: "",
      idProofNumber: "",
      roomId: 0,
      checkInDate: todayIso(),
      expectedCheckOutDate: todayIso(),
      advanceAmount: 0,
      totalAmount: 0,
    },
  });
  useEffect(() => {
    hotelService
      .rooms()
      .then((data) =>
        setRooms(data.filter((room) => room.status === "AVAILABLE")),
      )
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  }, [showToast]);
  const selectedRoom = rooms.find(
    (room) => room.id === Number(form.watch("roomId")),
  );
  const submit = async (values: CheckinForm) => {
    try {
      setSubmitting(true);
      await hotelService.checkin({
        ...values,
        email: values.email || undefined,
      });
      showToast("Guest checked in successfully");
      navigate("/bookings");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="panel overflow-hidden">
        <div className="grid gap-5 bg-gradient-to-br from-royal-navy via-royal-ink to-slate-950 p-4 text-white sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-royal-gold">
              Guest arrival
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Check-In
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Capture guest details, assign an available room, and create the
              active stay in one simple flow.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-sm font-semibold text-amber-50/90 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-amber-100/70">
              Available rooms
            </p>
            <p className="mt-1 text-3xl font-extrabold">{rooms.length}</p>
          </div>
        </div>
      </div>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="grid gap-5 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-5">
          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-app-border bg-royal-pearl px-4 py-3 sm:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-royal-gold shadow-sm">
                <FiUser />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-royal-ink">Guest Details</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Basic identity and contact information
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field
                label="Guest Name"
                error={form.formState.errors.guestName?.message}
              >
                <Input
                  placeholder="Full name"
                  {...form.register("guestName")}
                />
              </Field>
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input
                  placeholder="Mobile number"
                  {...form.register("phone")}
                />
              </Field>
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input
                  type="email"
                  placeholder="guest@example.com"
                  {...form.register("email")}
                />
              </Field>
              <Field
                label="ID Proof Number"
                error={form.formState.errors.idProofNumber?.message}
              >
                <Input
                  placeholder="Passport, Aadhaar, license..."
                  {...form.register("idProofNumber")}
                />
              </Field>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-app-border bg-royal-pearl px-4 py-3 sm:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <FiCalendar />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-royal-ink">Stay Details</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Room assignment and expected stay period
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <div className="sm:col-span-2">
                <Field
                  label="Room"
                  error={form.formState.errors.roomId?.message}
                >
                  <CustomSelect
                    value={Number(form.watch("roomId"))}
                    placeholder="Select available room"
                    onChange={(value) =>
                      form.setValue("roomId", Number(value), {
                        shouldValidate: true,
                      })
                    }
                    options={rooms.map((room) => ({
                      value: room.id,
                      label: `Room ${room.roomNumber}`,
                      description: `${room.roomType} - ${money(room.price)}`,
                    }))}
                  />
                </Field>
              </div>
              <Field
                label="Check-In Date"
                error={form.formState.errors.checkInDate?.message}
              >
                <Input type="date" {...form.register("checkInDate")} />
              </Field>
              <Field
                label="Expected Check-Out"
                error={form.formState.errors.expectedCheckOutDate?.message}
              >
                <Input type="date" {...form.register("expectedCheckOutDate")} />
              </Field>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-app-border bg-royal-pearl px-4 py-3 sm:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-success shadow-sm">
                <FiCreditCard />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-royal-ink">Payment</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Advance and total booking amount
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field
                label="Advance Amount"
                error={form.formState.errors.advanceAmount?.message}
              >
                <Input
                  type="number"
                  min={0}
                  {...form.register("advanceAmount")}
                />
              </Field>
              <Field
                label="Total Amount"
                error={form.formState.errors.totalAmount?.message}
              >
                <Input
                  type="number"
                  min={0}
                  {...form.register("totalAmount")}
                />
              </Field>
            </div>
          </section>
        </div>

        <aside className="panel h-fit overflow-hidden lg:sticky lg:top-24">
          <div className="h-1 bg-gradient-to-r from-royal-gold via-primary to-emerald-500" />
          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-royal-gold">
                Booking Summary
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-royal-ink">
                {selectedRoom
                  ? "Room " + selectedRoom.roomNumber
                  : "Select a room"}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedRoom
                  ? selectedRoom.roomType
                  : "Only available rooms are shown in the room list."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl bg-royal-pearl p-3 text-sm min-[380px]:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Rate
                </p>
                <p className="font-extrabold text-royal-ink">
                  {selectedRoom ? money(selectedRoom.price) : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="font-extrabold text-success">
                  {selectedRoom ? "Available" : "--"}
                </p>
              </div>
            </div>

            <Button className="w-full" disabled={submitting}>
              <FiLogIn />
              {submitting ? "Checking in..." : "Submit Check-In"}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
