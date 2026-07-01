import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClipboard,
  FiLogOut,
  FiPackage,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  CustomSelect,
  EmptyState,
  Field,
  Input,
  LoadingSpinner,
  StatusChip,
  Textarea,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/api";
import { hotelService } from "../services/hotel.service";
import type { AssetVerification, Booking } from "../types";
import { cx, money } from "../utils/format";

export function CheckoutPage() {
  const bookingIdParam = useParams().bookingId;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedId, setSelectedId] = useState<number>(
    bookingIdParam ? Number(bookingIdParam) : 0,
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [assets, setAssets] = useState<AssetVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    hotelService
      .bookings()
      .then((data) => {
        const active = data.filter((item) => item.status === "CHECKED_IN");
        setBookings(active);
        const firstId = selectedId || active[0]?.id || 0;
        setSelectedId(firstId);
      })
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    Promise.all([
      hotelService.booking(selectedId),
      hotelService.checkoutAssets(selectedId),
    ])
      .then(([bookingData, assetData]) => {
        setBooking(bookingData);
        setAssets(assetData.assets);
      })
      .catch((error) => showToast(getErrorMessage(error), "error"))
      .finally(() => setLoading(false));
  }, [selectedId]);
  const allOk = useMemo(
    () =>
      assets.length > 0 &&
      assets.every(
        (asset) =>
          asset.isWorking &&
          Number(asset.availableQuantity) === Number(asset.expectedQuantity),
      ),
    [assets],
  );
  const issueCount = useMemo(
    () =>
      assets.filter(
        (asset) =>
          !asset.isWorking ||
          Number(asset.availableQuantity) !== Number(asset.expectedQuantity),
      ).length,
    [assets],
  );
  const updateAsset = (index: number, patch: Partial<AssetVerification>) =>
    setAssets((current) =>
      current.map((asset, itemIndex) =>
        itemIndex === index ? { ...asset, ...patch } : asset,
      ),
    );
  const submit = async () => {
    if (!booking) return;
    try {
      setSubmitting(true);
      await hotelService.checkout(booking.id, assets);
      showToast(
        allOk
          ? "Checkout complete. Room will become available."
          : "Checkout complete. Room moved to maintenance.",
        allOk ? "success" : "warning",
      );
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
              Departure verification
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Check-Out
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Review the stay, verify room assets, and decide whether the room
              returns to service or moves to maintenance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-amber-50/90 backdrop-blur sm:min-w-72 sm:p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-100/70">
                Active stays
              </p>
              <p className="mt-1 text-3xl font-extrabold">{bookings.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-100/70">
                Assets
              </p>
              <p className="mt-1 text-3xl font-extrabold">{assets.length}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="panel overflow-hidden p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field label="Select Booking">
            <CustomSelect
              value={selectedId}
              placeholder="Select active booking"
              onChange={(value) => setSelectedId(Number(value))}
              options={bookings.map((item) => ({
                value: item.id,
                label: item.guestName,
                description: `Room ${item.room?.roomNumber || item.roomId} - ${money(item.totalAmount)}`,
              }))}
            />
          </Field>
          <div className="rounded-xl bg-royal-pearl px-4 py-3 text-sm font-semibold text-slate-600">
            {selectedId
              ? "Booking selected for asset verification"
              : "Choose a checked-in guest to continue"}
          </div>
        </div>
      </section>

      {!booking ? (
        <EmptyState
          title="No active booking selected"
          message="Choose a checked-in booking to begin checkout."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <section className="panel grid gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-4 lg:p-5">
              <div className="rounded-xl bg-royal-pearl p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Guest
                </p>
                <p className="mt-1 truncate font-extrabold text-royal-ink">
                  {booking.guestName}
                </p>
              </div>
              <div className="rounded-xl bg-royal-pearl p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Room
                </p>
                <p className="mt-1 font-extrabold text-royal-ink">
                  {booking.room?.roomNumber}
                </p>
              </div>
              <div className="rounded-xl bg-royal-pearl p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total
                </p>
                <p className="mt-1 font-extrabold text-royal-ink">
                  {money(booking.totalAmount)}
                </p>
              </div>
              <div className="rounded-xl bg-royal-pearl p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-1">
                  <StatusChip status={booking.status} />
                </div>
              </div>
            </section>

            <div
              className={cx(
                "flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold",
                allOk
                  ? "border-green-200 bg-green-50 text-success"
                  : "border-amber-200 bg-amber-50 text-warning",
              )}
            >
              {allOk ? (
                <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
              ) : (
                <FiAlertTriangle className="mt-0.5 shrink-0" size={18} />
              )}
              <span>
                {allOk
                  ? "All assets match. The room will become Available."
                  : "Some assets are missing or not working. The room will be marked Maintenance."}
              </span>
            </div>

            <section className="grid gap-4">
              {assets.map((asset, index) => {
                const assetOk =
                  asset.isWorking &&
                  Number(asset.availableQuantity) ===
                    Number(asset.expectedQuantity);

                return (
                  <article
                    key={asset.assetId}
                    className="panel overflow-hidden transition hover:shadow-royal"
                  >
                    <div
                      className={cx(
                        "h-1",
                        assetOk ? "bg-success" : "bg-warning",
                      )}
                    />
                    <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-[1fr_160px_150px_140px] lg:items-start">
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-royal-pearl text-royal-gold">
                            <FiPackage />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-lg font-extrabold text-royal-ink">
                              {asset.assetName}
                            </p>
                            <p className="text-sm font-semibold text-slate-500">
                              Expected Quantity: {asset.expectedQuantity}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Field label="Available Quantity">
                        <Input
                          type="number"
                          min={0}
                          value={asset.availableQuantity}
                          onChange={(event) =>
                            updateAsset(index, {
                              availableQuantity: Number(event.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Working">
                        <CustomSelect
                          value={asset.isWorking ? "yes" : "no"}
                          onChange={(value) =>
                            updateAsset(index, {
                              isWorking: value === "yes",
                            })
                          }
                          options={[
                            {
                              value: "yes",
                              label: "Working",
                              description: "Asset is usable",
                            },
                            {
                              value: "no",
                              label: "Not Working",
                              description: "Needs repair or replacement",
                            },
                          ]}
                        />
                      </Field>
                      <div className="flex items-end lg:pt-7">
                        <StatusChip
                          status={assetOk ? "AVAILABLE" : "MAINTENANCE"}
                        />
                      </div>
                      <div className="lg:col-span-4">
                        <Field label="Remarks">
                          <Textarea
                            value={asset.remarks || ""}
                            placeholder="Optional notes about condition, missing items, or repair needs"
                            onChange={(event) =>
                              updateAsset(index, {
                                remarks: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>

          <aside className="panel h-fit overflow-hidden xl:sticky xl:top-24">
            <div className="h-1 bg-gradient-to-r from-royal-gold via-primary to-emerald-500" />
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-pearl text-royal-gold">
                  <FiClipboard />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-royal-gold">
                    Final Review
                  </p>
                  <h3 className="text-xl font-extrabold text-royal-ink">
                    Room {booking.room?.roomNumber}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-xl bg-royal-pearl p-3 text-sm min-[380px]:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Verified
                  </p>
                  <p className="font-extrabold text-royal-ink">
                    {assets.length - issueCount}/{assets.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Issues
                  </p>
                  <p
                    className={cx(
                      "font-extrabold",
                      issueCount ? "text-warning" : "text-success",
                    )}
                  >
                    {issueCount}
                  </p>
                </div>
              </div>

              <div
                className={cx(
                  "rounded-xl border p-3 text-sm font-semibold",
                  allOk
                    ? "border-green-200 bg-green-50 text-success"
                    : "border-amber-200 bg-amber-50 text-warning",
                )}
              >
                {allOk
                  ? "Room will be marked Available after checkout."
                  : "Room will be marked Maintenance after checkout."}
              </div>

              <Button
                className="w-full"
                disabled={submitting || assets.length === 0}
                onClick={submit}
              >
                <FiLogOut />
                {submitting ? "Completing..." : "Complete Check-Out"}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
