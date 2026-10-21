import type { Model } from "../types/model";

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildActiveDays(models: Model[]): Set<string> {
  const set = new Set<string>();
  for (const m of models) {
    for (const ts of m.time_online || []) {
      set.add(dayKey(new Date(ts * 1000)));
    }
  }
  return set;
}

export function modelsOnlineOn(models: Model[], date: Date): Model[] {
  const key = dayKey(date);
  return models.filter((m) =>
    (m.time_online || []).some((ts) => dayKey(new Date(ts * 1000)) === key),
  );
}

export interface MonthInfo {
  year: number;
  month: number;
  label: string;
}

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTH_NAMES_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function getLastFiveMonths(today = new Date(), count = 5): MonthInfo[] {
  const result: MonthInfo[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()],
    });
  }
  return result;
}

export function formatSelectedDate(d: Date): string {
  return `${d.getDate()} ${MONTH_NAMES_GENITIVE[d.getMonth()]}`;
}
