"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";

export function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data: { ok?: boolean }) => setAuthed(Boolean(data.ok)))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-warm-white text-sm font-light text-foreground-soft">
        Loading...
      </div>
    );
  }

  return (
    <>
      {authed ? (
        <AdminDashboard onLogout={() => setAuthed(false)} />
      ) : (
        <AdminLogin onSuccess={() => setAuthed(true)} />
      )}
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "bg-warm-white text-foreground border-sage-muted",
          },
        }}
      />
    </>
  );
}
