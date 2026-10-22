import { useEffect, useMemo, useState } from "react";
import { fetchModels } from "../api/models";
import { fetchProfiles, type Profile } from "../api/profiles";
import type { Model } from "../types/model";
import ModelCard from "../components/ModelCard";
import Header from "../components/Header";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import ModelDetailsModal from "../components/ModelDetailsModal";
import CalendarPanel from "../components/CalendarPanel";
import { filterModels } from "../utils/search";
import { modelsOnlineOn } from "../utils/calendar";
import {
  getBlacklist,
  addToBlacklist,
  isSkipConfirm,
  setSkipConfirm,
  getFavorites,
  toggleFavorite,
} from "../utils/storage";

const PAGE_SIZE = 50;

type Gender = "female" | "couple_f_m" | "couple_f_f";

/** Mulberry32 — маленький seeded PRNG */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates с seeded PRNG */
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  const rand = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function ModelsGrid() {
  const [models, setModels] = useState<Model[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [pendingClose, setPendingClose] = useState<Model | null>(null);
  const [details, setDetails] = useState<Model | null>(null);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isReversed, setIsReversed] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [genderFilter, setGenderFilter] = useState<Gender | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchModels(), fetchProfiles()])
      .then(([modelsData, profilesData]) => {
        if (cancelled) return;
        const blacklist = getBlacklist();
        setModels(modelsData.filter((m) => !blacklist.includes(m.name)));
        setProfiles(profilesData);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const onlineNames = useMemo(() => {
    const modelNames = new Set(models.map((m) => m.name));
    return new Set(
      profiles.map((p) => p.name).filter((n) => modelNames.has(n)),
    );
  }, [models, profiles]);

  const profileByName = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const p of profiles) map.set(p.name, p);
    return map;
  }, [profiles]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    query,
    selectedDate,
    shuffleSeed,
    isReversed,
    favoritesOnly,
    onlineOnly,
    genderFilter,
  ]);

  // 1) Текстовый поиск
  const modelsByText = useMemo(
    () => filterModels(models, query),
    [models, query],
  );

  // 2) Дата
  const byDate = useMemo(
    () =>
      selectedDate ? modelsOnlineOn(modelsByText, selectedDate) : modelsByText,
    [modelsByText, selectedDate],
  );

  // 3) Избранное
  const byFavorites = useMemo(
    () =>
      favoritesOnly ? byDate.filter((m) => favorites.includes(m.name)) : byDate,
    [byDate, favoritesOnly, favorites],
  );

  // 4) Онлайн
  const byOnline = useMemo(
    () =>
      onlineOnly
        ? byFavorites.filter((m) => onlineNames.has(m.name))
        : byFavorites,
    [byFavorites, onlineOnly, onlineNames],
  );

  // 5) Gender
  const byGender = useMemo(
    () =>
      genderFilter
        ? byOnline.filter((m) => m.gender === genderFilter)
        : byOnline,
    [byOnline, genderFilter],
  );

  // 6) Перемешивание + разворот
  const ordered = useMemo(() => {
    let list = byGender;
    if (shuffleSeed !== 0) list = shuffleWithSeed(list, shuffleSeed);
    if (isReversed) list = [...list].reverse();
    return list;
  }, [byGender, shuffleSeed, isReversed]);

  const visible = ordered.slice(0, visibleCount);
  const hasMore = visibleCount < ordered.length;

  const removeFromState = (name: string) => {
    setModels((prev) => prev.filter((m) => m.name !== name));
    if (details?.name === name) setDetails(null);
  };

  const handleCloseRequest = (model: Model) => {
    if (isSkipConfirm()) {
      addToBlacklist(model.name);
      removeFromState(model.name);
    } else {
      setPendingClose(model);
    }
  };

  const handleConfirmClose = (skip: boolean) => {
    if (!pendingClose) return;
    addToBlacklist(pendingClose.name);
    if (skip) setSkipConfirm(true);
    removeFromState(pendingClose.name);
    setPendingClose(null);
  };

  const handleToggleFavorite = (model: Model) => {
    setFavorites(toggleFavorite(model.name));
  };

  const handleBlacklistFromDetails = (model: Model) => {
    setDetails(null);
    handleCloseRequest(model);
  };

  // Закрытие через крестик: скрыть + сбросить дату
  const closeCalendarAndReset = () => {
    setCalendarOpen(false);
    setSelectedDate(null);
  };

  // Клик по иконке календаря:
  // — открыто → закрываем И сбрасываем фильтр
  // — закрыто → открываем
  const handleToggleCalendar = () => {
    if (calendarOpen) {
      setCalendarOpen(false);
      setSelectedDate(null);
    } else {
      setCalendarOpen(true);
    }
  };

  const handleShuffle = () =>
    setShuffleSeed(() => Math.floor(Math.random() * 1e9) + 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        query={query}
        onQueryChange={setQuery}
        calendarOpen={calendarOpen}
        onToggleCalendar={handleToggleCalendar}
        onShuffle={handleShuffle}
        onReverse={() => setIsReversed((v) => !v)}
        isReversed={isReversed}
        favoritesOnly={favoritesOnly}
        onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
        onlineOnly={onlineOnly}
        onToggleOnlineOnly={() => setOnlineOnly((v) => !v)}
        genderFilter={genderFilter}
        onToggleGenderFilter={(g) =>
          setGenderFilter((prev) => (prev === g ? null : g))
        }
      />

      {calendarOpen && (
        <CalendarPanel
          baseModels={modelsByText}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onClose={closeCalendarAndReset}
          totalCount={byGender.length}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading && <Loader />}
        {!loading && error && (
          <div className="text-center text-red-600 py-16">Ошибка: {error}</div>
        )}

        {!loading && !error && (
          <>
            {ordered.length === 0 ? (
              <div className="text-center text-gray-500 py-16">
                Ничего не найдено
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  {visible.map((m) => (
                    <ModelCard
                      key={m.name}
                      model={m}
                      isFavorite={favorites.includes(m.name)}
                      isOnline={onlineNames.has(m.name)}
                      onClose={handleCloseRequest}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetails={setDetails}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm
                                 font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                    >
                      Показать ещё
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <ConfirmModal
        open={!!pendingClose}
        onCancel={() => setPendingClose(null)}
        onConfirm={handleConfirmClose}
      />

      <ModelDetailsModal
        model={details}
        isFavorite={details ? favorites.includes(details.name) : false}
        isOnline={details ? onlineNames.has(details.name) : false}
        streamUrl={
          details
            ? (profileByName.get(details.name)?.stream_full ?? null)
            : null
        }
        onClose={() => setDetails(null)}
        onToggleFavorite={handleToggleFavorite}
        onBlacklist={handleBlacklistFromDetails}
      />
    </div>
  );
}
