const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

interface Props {
  timestamps: number[]; // в секундах
}

export default function WeekActivity({ timestamps }: Props) {
  // Счётчик по дням недели (0 = пн ... 6 = вс)
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const ts of timestamps) {
    const d = new Date(ts * 1000);
    // getDay(): 0 = вс, 1 = пн, ... 6 = сб
    const idx = (d.getDay() + 6) % 7;
    counts[idx]++;
  }

  const max = Math.max(...counts, 0);

  return (
    <div className="grid grid-cols-7 gap-1.5 max-w-xs">
      {counts.map((c, i) => {
        const ratio = max > 0 ? c / max : 0;
        // ratio = 1 → полностью зелёный, ratio = 0 → прозрачный
        const opacity = ratio; // от 0 до 1
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded border border-gray-300"
              style={{
                backgroundColor:
                  c > 0 ? `rgba(34, 197, 94, ${opacity})` : "white",
              }}
              title={`${DAYS[i]}: ${c} записей`}
            />
            <span className="text-[10px] text-gray-500">{DAYS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
