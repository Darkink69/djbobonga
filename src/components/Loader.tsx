export default function Loader({
  text = "Загрузка моделей...",
}: {
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}
