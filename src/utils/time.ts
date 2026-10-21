const MONTHS = [
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

/**
 * Принимает timestamp в секундах.
 * Возвращает "x минут назад", "сегодня", "вчера" или "10 октября".
 */
export function formatOnline(tsSeconds?: number): string {
  if (!tsSeconds) return "—";

  const date = new Date(tsSeconds * 1000);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 60) {
    return diffMin <= 1 ? "1 минуту назад" : `${diffMin} минут назад`;
  }

  if (date >= startOfToday) return "сегодня";
  if (date >= startOfYesterday) return "вчера";

  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
