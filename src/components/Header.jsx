import {
  RefreshCwIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Header = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  // 로컬 시간 기반으로 날짜 포맷팅
  const [now, setNow] = useState(new Date());

  // 30초마다 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = `${now.getFullYear().toString().slice(2)}.${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}.${now.getDate().toString().padStart(2, "0")} ${now
    .getHours()
    .toString()
    .padStart(2, "0")} : ${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white dark:bg-[#2B2B30]">
      {/* 왼쪽: 로고 + 탭 */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-[#7566FF]">Syrup Friends</h1>
        <div className="flex items-center gap-4 text-lg">
          <span className="text-[#000000] dark:text-[#FFFFFF]">접수</span>
          <span className="text-[#BCBCBC] dark:text-[#7B7B85]">|</span>
          <span className="text-[#878787] dark:text-[#7B7B85]">주문내역</span>
        </div>
      </div>

      {/* 우측: 시간, 버튼, 페이지네이션 */}
      <div className="flex items-center gap-4 text-lg">
        <span className="text-[#000000] dark:text-[#FFFFFF]">
          {formattedDate}
        </span>

        <span className="text-[#BCBCBC] dark:text-[#7B7B85]">|</span>

        <button
          onClick={() => window.location.reload()}
          className="p-1.5 rounded hover:bg-transparent focus:outline-none"
        >
          <RefreshCwIcon
            size={20}
            className="text-[#000000] dark:text-[#FFFFFF]"
          />
        </button>

        <span className="text-[#BCBCBC] dark:text-[#7B7B85]">|</span>

        <button className="p-1.5 rounded hover:bg-transparent focus:outline-none">
          <SettingsIcon
            size={20}
            className="text-[#000000] dark:text-[#FFFFFF]"
          />
        </button>

        <span className="text-[#BCBCBC] dark:text-[#7B7B85]">|</span>

        <div className="flex items-center gap-2 text-base">
          <button
            onClick={onPrevPage}
            className="p-2 bg-[#E4E4E4] dark:bg-[#484850] rounded-md hover:bg-[#D4D4D4] dark:hover:bg-[#5A5A65] disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon
              size={20}
              className="text-[#000000] dark:text-[#FFFFFF]"
            />
          </button>

          <div className="px-3 py-2 text-[#000000] dark:text-[#FFFFFF] font-medium">
            {currentPage}/{totalPages}
          </div>

          <button
            onClick={onNextPage}
            className="p-2 bg-[#E4E4E4] dark:bg-[#484850] rounded-md hover:bg-[#D4D4D4] dark:hover:bg-[#5A5A65] disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon
              size={20}
              className="text-[#000000] dark:text-[#FFFFFF]"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
