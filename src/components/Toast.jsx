export default function Toast({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#22212799] dark:bg-[##7B7B8566] text-white dark:text-white font-semibold px-6 py-4 rounded-lg shadow-lg text-lg">
        접수가 들어왔습니다.
      </div>
    </div>
  );
}
