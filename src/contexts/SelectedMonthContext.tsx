'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORTS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

interface SelectedMonthContextValue {
  selYear: number;
  selMonth: number; // 0-indexed
  setSelYear: (y: number) => void;
  setSelMonth: (m: number) => void;
  isCurrentMonth: boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  viewDate: Date;
  monthName: string;
  monthShort: string;
}

const now = new Date();
const defaultContextValue: SelectedMonthContextValue = {
  selYear: now.getFullYear(),
  selMonth: now.getMonth(),
  setSelYear: () => {},
  setSelMonth: () => {},
  isCurrentMonth: true,
  goToPrevMonth: () => {},
  goToNextMonth: () => {},
  goToCurrentMonth: () => {},
  viewDate: now,
  monthName: MONTH_NAMES[now.getMonth()],
  monthShort: MONTH_SHORTS[now.getMonth()],
};

const SelectedMonthContext = createContext<SelectedMonthContextValue>(defaultContextValue);

export function SelectedMonthProvider({ children }: { children: ReactNode }) {
  const [selYear, setSelYear] = useState(() => new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(() => new Date().getMonth());

  const realNow = new Date();
  const isCurrentMonth = selYear === realNow.getFullYear() && selMonth === realNow.getMonth();

  const goToPrevMonth = useCallback(() => {
    setSelMonth((m) => {
      if (m === 0) {
        setSelYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelMonth((m) => {
      if (m === 11) {
        setSelYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToCurrentMonth = useCallback(() => {
    const today = new Date();
    setSelYear(today.getFullYear());
    setSelMonth(today.getMonth());
  }, []);

  const value = useMemo<SelectedMonthContextValue>(() => ({
    selYear,
    selMonth,
    setSelYear,
    setSelMonth,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    viewDate: new Date(selYear, selMonth, 15),
    monthName: `${MONTH_NAMES[selMonth]} ${selYear}`,
    monthShort: MONTH_SHORTS[selMonth],
  }), [selYear, selMonth, isCurrentMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth]);

  return (
    <SelectedMonthContext.Provider value={value}>
      {children}
    </SelectedMonthContext.Provider>
  );
}

export function useSelectedMonth() {
  return useContext(SelectedMonthContext);
}
