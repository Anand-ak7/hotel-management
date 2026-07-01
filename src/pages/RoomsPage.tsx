import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { z } from "zod";
import { DataTable } from "../components/DataTable";
import {
  Button,
  ConfirmDialog,
  CustomSelect,
  EmptyState,
  Field,
  IconButton,
  Input,
  LoadingSpinner,
  Modal,
  SearchBar,
  Select,
  StatusChip,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/api";
import { hotelService } from "../services/hotel.service";
import type { Room, RoomStatus } from "../types";
import { cx, money, roomStatusLabel } from "../utils/format";

const schema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomType: z.string().min(1, "Room type is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]),
});
type RoomInput = z.input<typeof schema>;
type RoomForm = z.output<typeof schema>;

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | RoomStatus>("ALL");
  const [editing, setEditing] = useState<Room | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Room | null>(null);
  const { showToast } = useToast();
  const form = useForm<RoomInput, unknown, RoomForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomNumber: "",
      roomType: "",
      price: 0,
      status: "AVAILABLE",
    },
  });
  const load = () =>
    hotelService
      .rooms()
      .then(setRooms)
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      rooms.filter(
        (room) =>
          (status === "ALL" || room.status === status) &&
          [room.roomNumber, room.roomType, room.status]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [rooms, search, status],
  );
  const statusOptions: Array<"ALL" | RoomStatus> = [
    "ALL",
    "AVAILABLE",
    "OCCUPIED",
    "MAINTENANCE",
  ];
  const statusCounts = useMemo(
    () => ({
      ALL: rooms.length,
      AVAILABLE: rooms.filter((room) => room.status === "AVAILABLE").length,
      OCCUPIED: rooms.filter((room) => room.status === "OCCUPIED").length,
      MAINTENANCE: rooms.filter((room) => room.status === "MAINTENANCE").length,
    }),
    [rooms],
  );
  const startCreate = () => {
    setEditing(null);
    form.reset({ roomNumber: "", roomType: "", price: 0, status: "AVAILABLE" });
    setOpen(true);
  };
  const startEdit = (room: Room) => {
    setEditing(room);
    form.reset({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: Number(room.price),
      status: room.status,
    });
    setOpen(true);
  };
  const submit = async (values: RoomForm) => {
    try {
      if (editing) await hotelService.updateRoom(editing.id, values);
      else await hotelService.createRoom(values);
      showToast(editing ? "Room updated" : "Room added");
      setOpen(false);
      load();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await hotelService.deleteRoom(deleting.id);
      showToast("Room deleted");
      setDeleting(null);
      load();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Rooms</h2>
          <p className="text-sm text-slate-500">
            Manage inventory, pricing, and status.
          </p>
        </div>
        <Button onClick={startCreate}>
          <FiPlus /> Add Room
        </Button>
      </div>
      <div className="panel overflow-hidden p-3 sm:p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search room number, type, or status"
          />
          <div className="hidden flex-wrap gap-2 md:flex">
            {statusOptions.map((option) => {
              const active = status === option;
              const label =
                option === "ALL" ? "All Rooms" : roomStatusLabel[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={cx(
                    "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-extrabold shadow-sm transition",
                    active
                      ? "border-royal-gold bg-royal-ink text-white shadow-royal"
                      : "border-app-border bg-white text-slate-600 hover:border-royal-gold/50 hover:bg-royal-champagne hover:text-royal-ink",
                  )}
                >
                  <span>{label}</span>
                  <span
                    className={cx(
                      "rounded-full px-2 py-0.5 text-xs",
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {statusCounts[option]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 md:hidden">
          <CustomSelect
            value={status}
            onChange={(value) => setStatus(value as "ALL" | RoomStatus)}
            options={[
              {
                value: "ALL",
                label: "All Rooms",
                description: `${statusCounts.ALL} rooms`,
              },
              {
                value: "AVAILABLE",
                label: "Available",
                description: `${statusCounts.AVAILABLE} ready`,
              },
              {
                value: "OCCUPIED",
                label: "Occupied",
                description: `${statusCounts.OCCUPIED} in use`,
              },
              {
                value: "MAINTENANCE",
                label: "Maintenance",
                description: `${statusCounts.MAINTENANCE} need care`,
              },
            ]}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No rooms found"
          message="Try a different search or add a new room."
        />
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {filtered.map((room) => (
              <div key={room.id} className="panel overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-royal-gold via-primary to-emerald-500" />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-extrabold">
                        Room {room.roomNumber}
                      </p>
                      <p className="text-sm text-slate-500">{room.roomType}</p>
                    </div>
                    <StatusChip status={room.status} />
                  </div>
                  <div className="mt-4 rounded-xl bg-royal-pearl p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Nightly price
                    </p>
                    <p className="text-lg font-extrabold text-royal-ink">
                      {money(room.price)}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={"/rooms/" + room.id + "/assets"}>
                      <IconButton label="View assets">
                        <FiEye />
                      </IconButton>
                    </Link>
                    <IconButton
                      label="Edit room"
                      onClick={() => startEdit(room)}
                    >
                      <FiEdit2 />
                    </IconButton>
                    <IconButton
                      label="Delete room"
                      onClick={() => setDeleting(room)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable
              rows={filtered}
              getKey={(row) => row.id}
              columns={[
                {
                  key: "number",
                  header: "Room Number",
                  sortable: true,
                  render: (row) => (
                    <span className="font-bold">{row.roomNumber}</span>
                  ),
                  sortValue: (row) => row.roomNumber,
                },
                {
                  key: "type",
                  header: "Room Type",
                  sortable: true,
                  render: (row) => row.roomType,
                  sortValue: (row) => row.roomType,
                },
                {
                  key: "price",
                  header: "Price",
                  sortable: true,
                  render: (row) => money(row.price),
                  sortValue: (row) => Number(row.price),
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
                      <Link to={"/rooms/" + row.id + "/assets"}>
                        <IconButton label="View assets">
                          <FiEye />
                        </IconButton>
                      </Link>
                      <IconButton
                        label="Edit room"
                        onClick={() => startEdit(row)}
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        label="Delete room"
                        onClick={() => setDeleting(row)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
      <Modal
        title={editing ? "Edit Room" : "Add Room"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={form.handleSubmit(submit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field
            label="Room Number"
            error={form.formState.errors.roomNumber?.message}
          >
            <Input {...form.register("roomNumber")} />
          </Field>
          <Field
            label="Room Type"
            error={form.formState.errors.roomType?.message}
          >
            <Input {...form.register("roomType")} />
          </Field>
          <Field label="Price" error={form.formState.errors.price?.message}>
            <Input type="number" {...form.register("price")} />
          </Field>
          <Field label="Status" error={form.formState.errors.status?.message}>
            <CustomSelect
              value={form.watch("status")}
              onChange={(value) =>
                form.setValue("status", value as RoomStatus, {
                  shouldValidate: true,
                })
              }
              options={[
                {
                  value: "AVAILABLE",
                  label: "Available",
                  description: "Ready for guests",
                },
                {
                  value: "OCCUPIED",
                  label: "Occupied",
                  description: "Guest currently staying",
                },
                {
                  value: "MAINTENANCE",
                  label: "Maintenance",
                  description: "Needs inspection or repair",
                },
              ]}
            />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button>{editing ? "Save Changes" : "Create Room"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete room"
        message="This will remove the room and its assets."
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
