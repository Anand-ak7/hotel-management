import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Field, Input } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@gmail.com", password: "admin@123" },
  });
  if (isAuthenticated) return <Navigate to="/" replace />;
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      showToast("Welcome back");
      navigate("/");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-app-border bg-white shadow-royal">
        <div className="bg-gradient-to-br from-royal-navy via-royal-ink to-slate-950 p-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-royal-gold/40 bg-royal-gold/15 text-royal-gold">
            <FiLock size={24} />
          </div>
          <h1 className="text-3xl font-extrabold">Hotel Management</h1>
        </div>
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pr-12"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-royal-champagne hover:text-royal-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>
            <Button className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
