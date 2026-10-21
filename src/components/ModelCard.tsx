import { useEffect, useRef, useState } from "react";
import type { Model } from "../types/model";
import { formatOnline } from "../utils/time";

interface Props {
  model: Model;
  isFavorite: boolean;
  isOnline: boolean;
  onClose: (model: Model) => void;
  onToggleFavorite: (model: Model) => void;
  onOpenDetails: (model: Model) => void;
}

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
       <rect width="100%" height="100%" fill="#e5e7eb"/>
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             font-family="sans-serif" font-size="14" fill="#9ca3af">
         Нет фото
       </text>
     </svg>`,
  );

export default function ModelCard({
  model,
  isFavorite,
  isOnline,
  onClose,
  onToggleFavorite,
  onOpenDetails,
}: Props) {
  const lastOnline = model.time_online?.[model.time_online.length - 1];
  const [imgSrc, setImgSrc] = useState(model.thumb_image);
  const [showRatingTip, setShowRatingTip] = useState(false);
  const tipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showRatingTip) return;
    const handler = (e: MouseEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setShowRatingTip(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showRatingTip]);

  return (
    <div className="relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="aspect-3/2 bg-gray-200 relative cursor-pointer"
        onClick={() => onOpenDetails(model)}
      >
        <img
          src={imgSrc}
          alt={model.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMG)}
        />

        {/* Рейтинг — без тени, чуть меньше */}
        <div
          className="absolute top-2 left-2"
          ref={tipRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowRatingTip((v) => !v)}
            className="text-white text-base font-semibold hover:opacity-90"
            aria-label="Рейтинг"
          >
            {model.id}
          </button>
          {showRatingTip && (
            <div className="absolute top-7 left-0 w-52 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-20">
              Рейтинг составлен из количества просмотров за последний период
              времени
            </div>
          )}
        </div>

        {/* Черный крестик — скрываем, если в избранном */}
        {!isFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(model);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black text-white
                       flex items-center justify-center hover:bg-gray-800 text-base leading-none"
            aria-label="В черный список"
          >
            ×
          </button>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="font-semibold truncate text-sm" title={model.name}>
          {model.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {isOnline ? (
            <>
              онлайн: <span className="text-red-600 font-bold">Сейчас!</span>
            </>
          ) : (
            <>онлайн: {formatOnline(lastOnline)}</>
          )}
        </p>
      </div>

      <button
        onClick={() => onToggleFavorite(model)}
        className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center"
        aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
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
  );
}
