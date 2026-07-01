import { api } from "./api";
import type {
  AssetVerification,
  Booking,
  CheckoutAssetsResponse,
  Room,
  RoomAsset,
  RoomStatus,
} from "../types";

export interface RoomPayload {
  roomNumber: string;
  roomType: string;
  price: number;
  status?: RoomStatus;
}
export interface AssetPayload {
  roomId: number;
  assetName: string;
  quantity: number;
}
export interface CheckinPayload {
  guestName: string;
  phone: string;
  email?: string;
  idProofNumber: string;
  roomId: number;
  checkInDate: string;
  expectedCheckOutDate: string;
  advanceAmount: number;
  totalAmount: number;
}

export const hotelService = {
  rooms: async () => (await api.get<Room[]>("/rooms")).data,
  createRoom: async (payload: RoomPayload) =>
    (await api.post<Room>("/rooms", payload)).data,
  updateRoom: async (id: number, payload: Partial<RoomPayload>) =>
    (await api.patch<Room>("/rooms/" + id, payload)).data,
  deleteRoom: async (id: number) => (await api.delete("/rooms/" + id)).data,
  roomAssets: async (roomId: number) =>
    (await api.get<RoomAsset[]>("/room-assets/room/" + roomId)).data,
  createAsset: async (payload: AssetPayload) =>
    (await api.post<RoomAsset>("/room-assets", payload)).data,
  updateAsset: async (id: number, payload: Partial<AssetPayload>) =>
    (await api.patch<RoomAsset>("/room-assets/" + id, payload)).data,
  deleteAsset: async (id: number) =>
    (await api.delete("/room-assets/" + id)).data,
  bookings: async () => (await api.get<Booking[]>("/bookings")).data,
  booking: async (id: number) =>
    (await api.get<Booking>("/bookings/" + id)).data,
  checkin: async (payload: CheckinPayload) =>
    (await api.post<Booking>("/checkin", payload)).data,
  checkoutAssets: async (bookingId: number) =>
    (
      await api.get<CheckoutAssetsResponse>(
        "/checkout/" + bookingId + "/assets",
      )
    ).data,
  checkout: async (bookingId: number, assets: AssetVerification[]) =>
    (await api.post("/checkout/" + bookingId + "/verify", { assets })).data,
};
