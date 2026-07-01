export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
export type BookingStatus = "CHECKED_IN" | "CHECKED_OUT";

export interface Admin {
  id: number;
  name: string;
  email: string;
}
export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}
export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  price: number | string;
  status: RoomStatus;
  assets?: RoomAsset[];
  createdAt?: string;
  updatedAt?: string;
}
export interface RoomAsset {
  id: number;
  roomId: number;
  assetName: string;
  quantity: number;
}
export interface Booking {
  id: number;
  guestName: string;
  phone: string;
  email?: string;
  idProofNumber: string;
  roomId: number;
  room?: Room;
  checkInDate: string;
  expectedCheckOutDate: string;
  actualCheckOutDate?: string | null;
  advanceAmount: number | string;
  totalAmount: number | string;
  status: BookingStatus;
  createdAt?: string;
}
export interface AssetVerification {
  assetId: number;
  assetName: string;
  expectedQuantity: number;
  availableQuantity: number;
  isWorking: boolean;
  remarks?: string;
}
export interface CheckoutAssetsResponse {
  bookingId: number;
  roomNumber: string;
  assets: AssetVerification[];
}
