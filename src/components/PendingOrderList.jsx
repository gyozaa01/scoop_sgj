import { useEffect, useState } from "react";

export default function PendingOrderList({ pendingOrders, onAccept }) {
  const [now, setNow] = useState(new Date());

  // 1초마다 now 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-full md:w-80 h-0 md:h-auto flex flex-col items-center justify-start py-4">
      <p className="text-xl font-semibold text-black dark:text-white mb-4 h-9 leading-[36px]">
        접수대기 <span className="text-[#7566FF]">{pendingOrders.length}</span>
      </p>

      <div className="w-[256px] h-[916px] bg-[#F4F4F4] dark:bg-[#484850] rounded-xl overflow-y-auto px-4 py-2 space-y-4">
        {pendingOrders.map((order, idx) => {
          const orderDate = new Date(order.OrderDate.$date);
          const elapsedMin = Math.max(0, Math.floor((now - orderDate) / 60000));
          const formattedTime = orderDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={idx}>
              {/* 시간 + 경과 */}
              <div className="flex justify-between items-center h-[28px] text-sm">
                <span className="text-[#5E5E5E] dark:text-[#E4E4E4]">
                  {formattedTime}
                </span>
                <div className="bg-[#FFE4E7] text-[#CC5F6C] dark:bg-[#BF606D] dark:text-[#FFE4E7] text-xs px-2 py-1 rounded-full">
                  {elapsedMin}분 경과
                </div>
              </div>

              {/* 주소 */}
              <div className="text-xs text-[#5E5E5E] dark:text-[#E4E4E4] mt-1 h-[24px] leading-[24px]">
                {order.Address}
              </div>

              {/* 메뉴 목록 */}
              <ul className="my-3 space-y-1">
                {order.MenuInfo.map((menu, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center h-[28px] text-sm font-bold text-black dark:text-white"
                  >
                    <span>{menu.Name}</span>
                    <span>x{menu.Count}</span>
                  </li>
                ))}
              </ul>

              {/* 상세보기 버튼 */}
              <button
                className="w-full bg-[#7566FF] text-white rounded-md h-[56px] text-sm"
                onClick={() => onAccept(order)}
              >
                상세보기
              </button>

              {/* 밑줄 구분선 */}
              {idx !== pendingOrders.length - 1 && (
                <hr className="mt-4 border-t border-[#BCBCBC] dark:border-[#7B7B85]" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
