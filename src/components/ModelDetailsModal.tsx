import { useEffect, useRef, useState } from "react";
import type { Model } from "../types/model";
import { formatOnline } from "../utils/time";
import WeekActivity from "./WeekActivity";
import HoursActivity from "./HoursActivity";

interface Props {
  model: Model | null;
  isFavorite: boolean;
  isOnline: boolean;
  streamUrl: string | null;
  onClose: () => void;
  onToggleFavorite: (model: Model) => void;
  onBlacklist: (model: Model) => void;
}

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
       <rect width="100%" height="100%" fill="#e5e7eb"/>
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             font-family="sans-serif" font-size="18" fill="#9ca3af">
         Нет фото
       </text>
     </svg>`,
  );

const VIDEO_LOAD_TIMEOUT_MS = 10000;

export default function ModelDetailsModal({
  model,
  isFavorite,
  isOnline,
  streamUrl,
  onClose,
  onToggleFavorite,
  onBlacklist,
}: Props) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [offlineNoticeOpen, setOfflineNoticeOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Сброс при смене модели
  useEffect(() => {
    if (model) setImgSrc(model.thumb_image);
    setVideoFailed(false);
    setVideoReady(false);
    setOfflineNoticeOpen(false);
  }, [model]);

  // Таймаут: если видео не начало играть — считаем, что оно недоступно
  useEffect(() => {
    if (!model || !isOnline || !streamUrl) return;
    if (videoReady || videoFailed) return;

    const timer = window.setTimeout(() => {
      if (!videoReady) {
        setVideoFailed(true);
        setOfflineNoticeOpen(true);
      }
    }, VIDEO_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [model, isOnline, streamUrl, videoReady, videoFailed]);

  // Esc — сначала закрывает оверлей, потом всё окно
  useEffect(() => {
    if (!model) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (offlineNoticeOpen) {
        setOfflineNoticeOpen(false);
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [model, offlineNoticeOpen, onClose]);

  if (!model) return null;

  const lastOnline = model.time_online?.[model.time_online.length - 1];
  const useVideo = isOnline && !!streamUrl && !videoFailed;

  const handleVideoError = () => {
    setVideoFailed(true);
    setOfflineNoticeOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Верх: видео при онлайне, иначе — фото */}
        <div className="relative aspect-3/2 bg-black rounded-t-xl overflow-hidden">
          {useVideo ? (
            <>
              <video
                ref={videoRef}
                src={streamUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                playsInline
                onCanPlay={() => setVideoReady(true)}
                onError={handleVideoError}
                onStalled={handleVideoError}
              />
              {videoFailed && (
                <img
                  src={imgSrc}
                  alt={model.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgSrc(FALLBACK_IMG)}
                />
              )}
            </>
          ) : (
            <img
              src={imgSrc}
              alt={model.name}
              className="w-full h-full object-cover"
              onError={() => setImgSrc(FALLBACK_IMG)}
            />
          )}

          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-gray-900
                       flex items-center justify-center shadow hover:bg-gray-100 text-lg leading-none z-20"
            aria-label="Закрыть"
          >
            ×
          </button>

          {/* Оверлей: видео не загрузилось */}
          {offlineNoticeOpen && videoFailed && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 p-4">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs w-full text-center">
                <p className="text-sm text-gray-800 mb-3">
                  К сожалению модель уже оффлайн, попробуйте позже.
                </p>
                <button
                  onClick={() => setOfflineNoticeOpen(false)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Ок
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-5 pb-16 relative">
          <h2 className="text-xl font-bold mb-3">{model.name}</h2>

          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Общее место в рейтинге:</span>{" "}
            {model.id}
          </p>

          <p className="text-sm text-gray-700 mb-4">
            <span className="font-medium">Онлайн:</span>{" "}
            {isOnline && !videoFailed ? (
              <span className="text-red-600 font-bold">Сейчас!</span>
            ) : (
              formatOnline(lastOnline)
            )}
          </p>

          <p className="text-sm font-medium text-gray-700 mb-2">На неделе:</p>
          <WeekActivity timestamps={model.time_online} />

          <p className="text-sm font-medium text-gray-700 mb-2 mt-4">Часы:</p>
          <HoursActivity timestamps={model.time_online} />

          {/* Кнопки внизу: черный список + сердечко рядом слева */}
          <div className="absolute bottom-4 left-5 flex items-center gap-3">
            {!isFavorite && (
              <button
                onClick={() => onBlacklist(model)}
                className="h-8 px-3 rounded-lg bg-black text-white text-xs font-semibold
                           flex items-center justify-center hover:bg-gray-800"
                aria-label="В черный список"
              >
                Черный список
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(model)}
              className="w-8 h-8 flex items-center justify-center"
              aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill={isFavorite ? "#ef4444" : "none"}
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
          </div>
        </div>
      </div>
    </div>
  );
}
