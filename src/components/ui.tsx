import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { FiCheck, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import type { BookingStatus, RoomStatus } from "../types";
import { bookingStatusLabel, cx, roomStatusLabel } from "../utils/format";

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      className={cx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-gradient-to-r from-royal-navy to-primary text-white shadow-soft hover:-translate-y-0.5 hover:shadow-royal",
        variant === "secondary" &&
          "border border-app-border bg-white/90 text-royal-ink shadow-sm hover:border-royal-gold/50 hover:bg-royal-champagne",
        variant === "danger" &&
          "bg-danger text-white shadow-sm hover:bg-red-700",
        variant === "ghost" &&
          "text-slate-600 hover:bg-royal-champagne hover:text-royal-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-white text-slate-600 shadow-sm transition hover:border-royal-gold/50 hover:bg-royal-champagne hover:text-royal-navy",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-sm font-medium text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "focus-ring w-full rounded-xl border border-app-border bg-white/95 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}
export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="group relative w-full">
      <select
        className={cx(
          "focus-ring h-12 w-full appearance-none rounded-2xl border border-app-border bg-white/95 px-4 py-2.5 pr-11 text-sm font-semibold text-royal-ink shadow-sm transition hover:border-royal-gold/50 hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
          className,
        )}
        {...props}
      />
      <div className="pointer-events-none absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-royal-champagne text-royal-gold transition group-focus-within:bg-royal-gold group-focus-within:text-white">
        <FiChevronDown size={18} />
      </div>
    </div>
  );
}
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "focus-ring min-h-24 w-full rounded-xl border border-app-border bg-white/95 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export type DropdownOption = {
  value: string | number;
  label: string;
  description?: string;
};

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled,
}: {
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find(
    (option) => String(option.value) === String(value),
  );

  const updateMenuPosition = () => {
    if (buttonRef.current)
      setMenuRect(buttonRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          updateMenuPosition();
          setOpen((current) => !current);
        }}
        className={cx(
          "focus-ring flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-app-border bg-white/95 px-4 py-2.5 text-left shadow-sm transition hover:border-royal-gold/50 hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-100",
          open && "border-royal-gold ring-2 ring-royal-gold/20",
        )}
      >
        <span className="min-w-0">
          <span
            className={cx(
              "block truncate text-sm font-extrabold",
              selected ? "text-royal-ink" : "text-slate-400",
            )}
          >
            {selected?.label || placeholder}
          </span>
          {selected?.description && (
            <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
              {selected.description}
            </span>
          )}
        </span>
        <span
          className={cx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-royal-champagne text-royal-gold transition",
            open && "rotate-180 bg-royal-gold text-white",
          )}
        >
          <FiChevronDown size={18} />
        </span>
      </button>

      {open &&
        menuRect &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] max-h-72 overflow-auto rounded-2xl border border-app-border bg-white p-2 shadow-royal"
            style={{
              left: menuRect.left,
              top: menuRect.bottom + 8,
              width: menuRect.width,
              maxWidth: "calc(100vw - 1rem)",
            }}
          >
            {options.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(String(option.value));
                    setOpen(false);
                  }}
                  className={cx(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                    active
                      ? "bg-royal-ink text-white"
                      : "text-royal-ink hover:bg-royal-champagne",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold">
                      {option.label}
                    </span>
                    {option.description && (
                      <span
                        className={cx(
                          "mt-0.5 block truncate text-xs font-semibold",
                          active ? "text-white/70" : "text-slate-500",
                        )}
                      >
                        {option.description}
                      </span>
                    )}
                  </span>
                  {active && <FiCheck className="shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="group relative w-full sm:max-w-md">
      <div className="pointer-events-none absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-royal-champagne text-royal-gold transition group-focus-within:bg-royal-gold group-focus-within:text-white">
        <FiSearch />
      </div>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl pl-14 pr-11 text-base shadow-soft"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-royal-ink"
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary";
}) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm",
        tone === "neutral" && "border-slate-200 bg-slate-100 text-slate-600",
        tone === "success" && "border-green-200 bg-green-50 text-success",
        tone === "warning" && "border-amber-200 bg-amber-50 text-warning",
        tone === "danger" && "border-red-200 bg-red-50 text-danger",
        tone === "primary" && "border-blue-200 bg-blue-50 text-primary",
      )}
    >
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: RoomStatus | BookingStatus }) {
  const tone =
    status === "AVAILABLE" || status === "CHECKED_OUT"
      ? "success"
      : status === "MAINTENANCE"
        ? "warning"
        : "primary";
  const label =
    status in roomStatusLabel
      ? roomStatusLabel[status as RoomStatus]
      : bookingStatusLabel[status as BookingStatus];
  return <Badge tone={tone}>{label}</Badge>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: IconType;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  return (
    <div className="panel group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:shadow-royal">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-royal-gold via-primary to-emerald-500" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-royal-gold/10 transition group-hover:scale-110" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-royal-ink">
            {value}
          </p>
        </div>
        <div
          className={cx(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm",
            tone === "primary" && "border-blue-100 bg-blue-50 text-primary",
            tone === "success" && "border-green-100 bg-green-50 text-success",
            tone === "warning" && "border-amber-100 bg-amber-50 text-warning",
            tone === "danger" && "border-red-100 bg-red-50 text-danger",
          )}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-royal-champagne border-t-royal-gold" />
    </div>
  );
}
export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-royal-gold/35 bg-white/80 p-8 text-center shadow-sm">
      <p className="font-bold text-royal-ink">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-app-border bg-white shadow-royal">
        <div className="h-1 bg-gradient-to-r from-royal-gold via-primary to-emerald-500" />
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-royal-ink">{title}</h2>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <Modal title={title} open={open} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-app-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-500">
        Page {page} of {totalPages}
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
