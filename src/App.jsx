import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import EmptyState from "./components/EmptyState";
import Toast from "./components/Toast";
import PendingOrderList from "./components/PendingOrderList";

export default function App() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [queue, setQueue] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [hasAcceptedOrders] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("https://ct.pointda.com/api/kds/pending")
        .then((res) => res.json())
        .then((data) => {
          const now = new Date();
          const updated = data
            .sort(
              (a, b) =>
                new Date(a.OrderDate?.$date || 0) -
                new Date(b.OrderDate?.$date || 0)
            )
            .map((order, index) => ({
              ...order,
              OrderDate: {
                $date: new Date(now.getTime() + index * 60000).toISOString(),
              },
            }));

          setPendingOrders([updated[0]]);
          setQueue(updated.slice(1));
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (queue.length === 0) return;
    const interval = setInterval(() => {
      setPendingOrders((prev) => [...prev, queue[0]]);
      setQueue((prev) => prev.slice(1));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 60000);

    return () => clearInterval(interval);
  }, [queue]);

  const handlePrevPage = () => {};
  const handleNextPage = () => {};

  const handleAcceptOrder = (order) => {
    console.log("수락 처리:", order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#2B2B30] relative">
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

        <PendingOrderList
          pendingOrders={pendingOrders}
          onAccept={handleAcceptOrder}
        />
      </div>

      {/* 토스트 메시지 */}
      <Toast visible={showToast} />
    </div>
  );
}
