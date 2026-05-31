"use client";
import { useTransactionsRealtime } from "@/lib/hooks/useTransactions";

/** Mounts Supabase Realtime subscriptions for the authenticated app */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useTransactionsRealtime();
  return <>{children}</>;
}
