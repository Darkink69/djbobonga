import { useMemo } from "react";
import type { Model } from "../types/model";
import {
  buildActiveDays,
  dayKey,
  formatSelectedDate,
  getLastFiveMonths,
} from "../utils/calendar";

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

interface Props {
  baseModels: Model[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  onClose: () => void;
  totalCount: number;
}

export default function CalendarPanel({
  baseModels,
  selectedDate,
  onSelectDate,
  onClose,
  totalCount,
}: Props) {
  const fiveMonths = useMemo(() => getLastFiveMonths(new Date(), 5), []);
  const twoMonths = useMemo(() => getLastFiveMonths(new Date(), 2), []);

  const activeDays = useMemo(() => buildActiveDays(baseModels), [baseModels]);

  const today = new Date();
  const todayKey = dayKey(today);
  const selectedKey = selectedDate ? dayKey(selectedDate) : null;

  const summary = selectedDate
    ? `Найдено ${totalCount} моделей, которые были в эфире ${formatSelectedDate(selectedDate)}`
    : `Найдено ${totalCount} моделей.`;

  return (
    <div className="w-full bg-white border-t border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 w-8 h-8 rounded-full bg-gray-100
                     text-gray-800 flex items-center justify-center hover:bg-gray-200 text-lg leading-none z-10"
          aria-label="Закрыть календарь"
        >
          ×
        </button>

        {/* Мобильная версия: 2 месяца */}
        <div className="grid grid-cols-2 gap-4 pr-10 md:hidden">
          {twoMonths.map((m) => (
            <MonthGrid
              key={`m-${m.year}-${m.month}`}
              monthInfo={m}
              activeDays={activeDays}
              todayKey={todayKey}
              selectedKey={selectedKey}
              onSelect={onSelectDate}
            />
          ))}
        </div>

        {/* Десктоп: 5 месяцев */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 pr-10">
          {fiveMonths.map((m) => (
            <MonthGrid
              key={`d-${m.year}-${m.month}`}
              monthInfo={m}
              activeDays={activeDays}
              todayKey={todayKey}
              selectedKey={selectedKey}
              onSelect={onSelectDate}
            />
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">{summary}</div>
      </div>
    </div>
  );
}

interface MonthGridProps {
  monthInfo: { year: number; month: number; label: string };
  activeDays: Set<string>;
  todayKey: string;
  selectedKey: string | null;
  onSelect: (d: Date) => void;
}

function MonthGrid({
  monthInfo,
  activeDays,
  todayKey,
  selectedKey,
  onSelect,
}: MonthGridProps) {
  const { year, month, label } = monthInfo;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-2 text-center">
        {label}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-[10px] text-gray-400 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="w-full aspect-square" />;

          const key = dayKey(d);
          const isToday = key === todayKey;
          const isFuture = key > todayKey;
          const hasData = activeDays.has(key);
          const disabled = isFuture || !hasData;
          const isSelected = key === selectedKey;

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={[
                "w-full aspect-square rounded flex items-center justify-center transition-colors",
                disabled
                  ? "text-[13px] text-gray-300 cursor-not-allowed font-normal"
                  : "text-[15px] font-bold text-gray-800 hover:bg-gray-100",
                isSelected ? "bg-indigo-600 text-white! font-bold" : "",
                isToday && !isSelected ? "ring-2 ring-red-500" : "",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
