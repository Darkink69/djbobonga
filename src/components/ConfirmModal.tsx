import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: (skipConfirm: boolean) => void;
}

export default function ConfirmModal({ open, onCancel, onConfirm }: Props) {
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-gray-800 mb-4">
          Вы уверены, что хотите добавить эту модель в черный список?
        </p>

        <label className="flex items-center gap-2 text-sm text-gray-700 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={skip}
            onChange={(e) => setSkip(e.target.checked)}
            className="w-4 h-4"
          />
          Больше не спрашивать
        </label>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            onClick={() => onConfirm(skip)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Ок
          </button>
        </div>
      </div>
    </div>
  );
}
