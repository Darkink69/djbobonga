interface HeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  calendarOpen: boolean;
  onToggleCalendar: () => void;
  onShuffle: () => void;
  onReverse: () => void;
  isReversed: boolean;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  onlineOnly: boolean;
  onToggleOnlineOnly: () => void;
}

export default function Header({
  query,
  onQueryChange,
  calendarOpen,
  onToggleCalendar,
  onShuffle,
  onReverse,
  isReversed,
  favoritesOnly,
  onToggleFavoritesOnly,
  onlineOnly,
  onToggleOnlineOnly,
}: HeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold whitespace-nowrap">Dj Bobonga</h1>

        <div className="flex items-center gap-2 w-full max-w-2xl justify-end">
          {/* Фильтр избранного */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              favoritesOnly
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
            aria-label="Только избранные"
            title="Только избранные"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill={favoritesOnly ? "#ef4444" : "none"}
              stroke="#ef4444"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s-7.5-4.6-9.8-9.1C.6 8.6 2.3 5 5.7 5c2 0 3.3 1 4.3 2.4C11 6 12.3 5 14.3 5c3.4 0 5.1 3.6 3.5 6.9C19.5 16.4 12 21 12 21z"
              />
            </svg>
          </button>

          {/* Фильтр онлайн */}
          <button
            onClick={onToggleOnlineOnly}
            className={`h-9 px-3 flex items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors ${
              onlineOnly
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-red-500 text-red-600 hover:bg-red-50"
            }`}
            aria-label="Только онлайн"
            title="Только онлайн"
          >
            Онлайн
          </button>

          {/* Случайный выбор */}
          <button
            onClick={onShuffle}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300
                       text-gray-600 hover:bg-gray-50"
            aria-label="Случайный выбор"
            title="Случайный выбор"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3h5v5" />
              <path d="M4 20L21 3" />
              <path d="M21 16v5h-5" />
              <path d="M15 15l6 6" />
              <path d="M4 4l5 5" />
            </svg>
          </button>

          {/* Развернуть список */}
          <button
            onClick={onReverse}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              isReversed
                ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            aria-label="Развернуть список"
            title="Развернуть список"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 4v16" />
              <path d="M7 4l-3 3" />
              <path d="M7 4l3 3" />
              <path d="M17 20V4" />
              <path d="M17 20l-3-3" />
              <path d="M17 20l3-3" />
            </svg>
          </button>

          {/* Календарь */}
          <button
            onClick={onToggleCalendar}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              calendarOpen
                ? "border-red-500 text-red-600 bg-red-50"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            aria-label="Фильтр по дате"
            title="Фильтр по дате"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
          </button>

          {/* Поиск */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Поиск по имени..."
              className="w-full rounded-lg border border-gray-300 pl-3 pr-9 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Сбросить поиск"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-700 text-lg leading-none px-1"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
