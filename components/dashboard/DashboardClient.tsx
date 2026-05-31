"use client";

import { motion } from "framer-motion";
import { HealthScore } from "./HealthScore";
import { QuickStats } from "./QuickStats";
import { PainPoints } from "./PainPoints";
import { RecentTransactions } from "./RecentTransactions";
import { GoalsOverview } from "./GoalsOverview";
import { SpendingDNA } from "./SpendingDNA";
import { useTotalNetWorth } from "@/lib/hooks/useAccounts";
import type { Profile } from "@/lib/supabase/types";
import { getPeriodLabel, getCurrentPeriod } from "@/lib/utils/dates";

interface Props {
  profile: Profile | null;
  income: number;
  expense: number;
  savings: number;
  goalProgress: number;
  period?: string;
}

export function DashboardClient({ profile, income, expense, savings, goalProgress, period }: Props) {
  const netWorth = useTotalNetWorth();
  const activePeriod = period ?? getCurrentPeriod();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Olá{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {getPeriodLabel(activePeriod)} · visão geral
        </p>
      </motion.div>

      {/* Quick stats */}
      <QuickStats income={income} expense={expense} savings={savings} netWorth={netWorth} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: health score */}
        <div className="lg:col-span-1">
          <HealthScore
            monthlyIncome={profile?.monthly_income ?? income}
            goalProgress={goalProgress}
          />
        </div>

        {/* Center: recent transactions */}
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>

        {/* Right: pain points */}
        <div className="lg:col-span-1">
          <PainPoints />
        </div>
      </div>

      {/* Goals */}
      <GoalsOverview />

      {/* Spending DNA */}
      <SpendingDNA />
    </div>
  );
}
