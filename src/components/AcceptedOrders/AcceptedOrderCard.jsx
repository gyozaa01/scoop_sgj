import { useEffect, useState } from "react";

// 카드 높이 상수
const SMALL_CARD = 494;
const BIG_CARD = 1008;

export default function AcceptedOrderCard({
  order,
  orderIndex,
  showHeader,
  showButton,
  cardHeight,
  onComplete,
  isFirst,
  isLast,
}) {
  const acceptedDate = new Date(order.AcceptedDate.$date);
  const [now, setNow] = useState(new Date());

  // 실시간 경과 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsedMin = Math.max(
    0,
    Math.floor((now.getTime() - acceptedDate.getTime()) / 60000)
  );
  const formattedTime = acceptedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const elapsedColorClass =
    elapsedMin >= 5
      ? "bg-[#EF3636] dark:bg-[#EC6363] text-white"
      : "bg-white dark:bg-[#ACA3FF] text-black border border-[#E4E4E4] dark:border-[#ACA3FF]";

  return (
    <div
      className={`bg-[#F4F4F4] dark:bg-[#484850] px-4 pt-4 pb-3 flex flex-col justify-between
    ${cardHeight === BIG_CARD ? "h-[1008px]" : "h-[494px]"}
    ${
      isFirst && isLast
        ? "rounded-3xl"
        : isFirst
        ? "rounded-t-3xl rounded-b-lg"
        : isLast
        ? "rounded-t-lg rounded-b-3xl"
        : "rounded-lg"
    }`}
    >
      {showHeader && (
        <div className="bg-black dark:bg-[#65656F] text-white rounded-2xl px-4 py-3 mb-6">
          <div className="flex justify-between items-center font-bold mb-1">
            {/* 주문 수락 순서 */}
            <span>#{orderIndex}</span>

            <div className="flex items-center gap-2">
              {/* OrderDate */}
              <span className="text-[12px] font-medium">{formattedTime}</span>
              {/* 경과 시간 */}
              <div
                className={`px-2 py-1 rounded-xl text-[12px] ${elapsedColorClass}`}
              >
                {elapsedMin}분 경과
              </div>
            </div>
          </div>

          {/* 주문 장소 */}
          <div className="font-semibold">{order.Address}</div>
        </div>
      )}
      <div className="flex-1 overflow-hidden space-y-4">
        {/* 메뉴 별로 */}
        {order.MenuInfo.map((menu, i) => (
          <div key={i}>
            <div className="flex justify-between font-bold mb-3 text-[24px]">
              <span>{menu.Name}</span>
              <span>x{menu.Count}</span>
            </div>

            {(menu.PriceName || menu.Options?.length > 0) && (
              <div className="pl-4 text-[#5E5E5E] dark:text-[#E4E4E4] space-y-1 mb-4 text-[20px]">
                {menu.PriceName && <div>{menu.PriceName}</div>}
                {menu.Options?.map((opt, j) => (
                  <div key={j}>{opt.Name}</div>
                ))}
              </div>
            )}

            {/* 밑줄 */}
            <hr className="border-t border-[#BCBCBC] dark:border-[#7B7B85]" />
          </div>
        ))}

        {/* 요청사항 */}
        {order.Request?.Store && (
          <div className="mt-2">
            <div className="bg-white dark:bg-[#65656F] rounded-md p-4 font-semibold text-black dark:text-white">
              <div className="text-[#7566FF] dark:text-[#C8C2FF] font-bold mb-1 text-[24px]">
                요청사항
              </div>
              <div className="text-[20px]">{order.Request.Store}</div>
            </div>
          </div>
        )}
      </div>

      {/* 조리 완료 버튼 */}
      {showButton && (
        <div className="mt-auto pt-4">
          <button
            className="w-full bg-[#7566FF] text-white rounded-2xl h-[56px] font-bold"
            onClick={() => {
              onComplete(order);
            }}
          >
            조리 완료
          </button>
        </div>
      )}
    </div>
  );
}
