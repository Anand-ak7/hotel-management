import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { DataTable } from "../components/DataTable";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  Input,
  LoadingSpinner,
  Modal,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/api";
import { hotelService } from "../services/hotel.service";
import type { Room, RoomAsset } from "../types";

const schema = z.object({
  assetName: z.string().min(1, "Asset name is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});
type AssetInput = z.input<typeof schema>;
type AssetForm = z.output<typeof schema>;

export function RoomAssetsPage() {
  const roomId = Number(useParams().roomId);
  const [room, setRoom] = useState<Room | null>(null);
  const [assets, setAssets] = useState<RoomAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomAsset | null>(null);
  const [deleting, setDeleting] = useState<RoomAsset | null>(null);
  const { showToast } = useToast();
  const form = useForm<AssetInput, unknown, AssetForm>({
    resolver: zodResolver(schema),
    defaultValues: { assetName: "", quantity: 1 },
  });
  const load = () =>
    Promise.all([hotelService.rooms(), hotelService.roomAssets(roomId)])
      .then(([rooms, assetData]) => {
        setRoom(rooms.find((item) => item.id === roomId) || null);
        setAssets(assetData);
      })
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [roomId]);
  const startCreate = () => {
    setEditing(null);
    form.reset({ assetName: "", quantity: 1 });
    setOpen(true);
  };
  const startEdit = (asset: RoomAsset) => {
    setEditing(asset);
    form.reset({ assetName: asset.assetName, quantity: asset.quantity });
    setOpen(true);
  };
  const submit = async (values: AssetForm) => {
    try {
      if (editing) await hotelService.updateAsset(editing.id, values);
      else await hotelService.createAsset({ roomId, ...values });
      showToast(editing ? "Asset updated" : "Asset added");
      setOpen(false);
      load();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await hotelService.deleteAsset(deleting.id);
      showToast("Asset deleted");
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
          <Link to="/rooms" className="text-sm font-bold text-primary">
            Back to rooms
          </Link>
          <h2 className="mt-1 text-2xl font-extrabold">
            Room {room?.roomNumber} Assets
          </h2>
          <p className="text-sm text-slate-500">
            Track expected quantities for checkout verification.
          </p>
        </div>
        <Button onClick={startCreate}>
          <FiPlus /> Add Asset
        </Button>
      </div>
      {assets.length === 0 ? (
        <EmptyState
          title="No assets yet"
          message="Add AC, Fan, TV, Chair, Bed, and other room items."
        />
      ) : (
        <DataTable
          rows={assets}
          getKey={(row) => row.id}
          columns={[
            {
              key: "name",
              header: "Asset Name",
              sortable: true,
              render: (row) => (
                <span className="font-bold">{row.assetName}</span>
              ),
              sortValue: (row) => row.assetName,
            },
            {
              key: "quantity",
              header: "Quantity",
              sortable: true,
              render: (row) => row.quantity,
              sortValue: (row) => row.quantity,
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <IconButton label="Edit asset" onClick={() => startEdit(row)}>
                    <FiEdit2 />
                  </IconButton>
                  <IconButton
                    label="Delete asset"
                    onClick={() => setDeleting(row)}
                  >
                    <FiTrash2 />
                  </IconButton>
                </div>
              ),
            },
          ]}
        />
      )}
      <Modal
        title={editing ? "Edit Asset" : "Add Asset"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={form.handleSubmit(submit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field
            label="Asset Name"
            error={form.formState.errors.assetName?.message}
          >
            <Input {...form.register("assetName")} />
          </Field>
          <Field
            label="Quantity"
            error={form.formState.errors.quantity?.message}
          >
            <Input type="number" {...form.register("quantity")} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button>{editing ? "Save Changes" : "Add Asset"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete asset"
        message="This asset will be removed from the room checklist."
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
