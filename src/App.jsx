import { Header } from "./components/Header";

export default function App() {
  // 더미 핸들러
  const handlePrevPage = () => {};
  const handleNextPage = () => {};

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#2B2B30]">
      {/* 헤더 영역 */}
      <Header
        currentPage={1}
        totalPages={12}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />

      {/* 헤더가 아닌(메인) 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 메인 주문 카드 컨테이너) */}
        <main className="flex-1 h-0 md:h-auto"></main>
        {/* 대기 주문 리스트 사이드바 */}
        <aside className="w-full md:w-80 h-0 md:h-auto"></aside>
      </div>
    </div>
  );
}
