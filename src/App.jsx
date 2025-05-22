import { Header } from "./components/Header";
import EmptyState from "./components/EmptyState";

export default function App() {
  const hasAcceptedOrders = false; // 임시 더미
  const hasPendingOrders = false; // 임시 더미

  // 더미 핸들러
  const handlePrevPage = () => {};
  const handleNextPage = () => {};

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#2B2B30]">
      {/* 헤더 영역 */}
      <Header
        currentPage={1}
        totalPages={1}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 h-0 md:h-auto bg-white dark:bg-[#2B2B30]">
          {hasAcceptedOrders ? (
            <div className="p-4">{/* 주문 카드 영역 */}</div>
          ) : (
            <EmptyState />
          )}
        </main>

        {/* 접수 대기 영역 */}
        <aside className="w-full md:w-80 h-0 md:h-auto flex flex-col items-center justify-start py-4">
          <p className="text-xl font-semibold text-black dark:text-white mb-4">
            접수대기 <span className="text-[#7566FF]">0</span>
          </p>

          <div className="w-[256px] h-[916px] bg-[#F4F4F4] dark:bg-[#484850] rounded-xl flex items-center justify-center">
            {!hasPendingOrders && <div></div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
