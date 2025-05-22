export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#5E5E5E] dark:text-[#BCBCBC]">
      <img
        src="/empty.png"
        alt="접수 비어 있음"
        className="w-[240px] h-[200px] mb-4 opacity-60"
      />
      <p className="text-2xl">접수내역이 없습니다.</p>
    </div>
  );
}
