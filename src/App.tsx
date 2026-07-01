import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RoomAssetsPage } from "./pages/RoomAssetsPage";
import { BookingsPage } from "./pages/BookingsPage";
import { CheckinPage } from "./pages/CheckinPage";
import { CheckoutPage } from "./pages/CheckoutPage";

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              index
              element={
                <Page>
                  <DashboardPage />
                </Page>
              }
            />
            <Route
              path="rooms"
              element={
                <Page>
                  <RoomsPage />
                </Page>
              }
            />
            <Route
              path="rooms/:roomId/assets"
              element={
                <Page>
                  <RoomAssetsPage />
                </Page>
              }
            />
            <Route
              path="bookings"
              element={
                <Page>
                  <BookingsPage />
                </Page>
              }
            />
            <Route
              path="checkin"
              element={
                <Page>
                  <CheckinPage />
                </Page>
              }
            />
            <Route
              path="checkout"
              element={
                <Page>
                  <CheckoutPage />
                </Page>
              }
            />
            <Route
              path="checkout/:bookingId"
              element={
                <Page>
                  <CheckoutPage />
                </Page>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
