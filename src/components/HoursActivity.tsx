interface Props {
  timestamps: number[]; // в секундах
}

const LABELS = [
  "00",
  "02",
  "04",
  "06",
  "08",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
];

export default function HoursActivity({ timestamps }: Props) {
  // Счётчик по 2-часовым интервалам (0 → 00:00–02:00, ... 11 → 22:00–24:00)
  const counts = new Array(12).fill(0);
  for (const ts of timestamps) {
    const d = new Date(ts * 1000);
    const idx = Math.floor(d.getHours() / 2);
    counts[idx]++;
  }

  const max = Math.max(...counts, 0);

  return (
    <div className="grid grid-cols-12 gap-1.5 max-w-md">
      {counts.map((c, i) => {
        const ratio = max > 0 ? c / max : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{
                backgroundColor:
                  c > 0 ? `rgba(59, 130, 246, ${ratio})` : "white",
              }}
              title={`${LABELS[i]}:00–${LABELS[(i + 1) % 12]}:00: ${c} записей`}
            />
            <span className="text-[10px] text-gray-500">{LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
