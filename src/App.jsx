import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import EmptyState from "./components/EmptyState";
import Toast from "./components/Toast";
import PendingOrderList from "./components/PendingOrderList";
import AcceptedOrderBoard from "./components/AcceptedOrders/AcceptedOrderBoard";

export default function App() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [queue, setQueue] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnsCount, setColumnsCount] = useState(0);

  const hasAcceptedOrders = acceptedOrders.length > 0;

  // 1) 초기 Accepted 불러오기
  useEffect(() => {
    fetch("https://ct.pointda.com/api/kds/accepted")
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const filtered = data.filter((order) =>
          ["주문테스트4", "주문테스트5"].some((addr) =>
            order.Address.includes(addr)
          )
        );
        const updated = filtered.map((order) => ({
          ...order,
          AcceptedDate: { $date: now.toISOString() },
        }));
        setAcceptedOrders(updated);
      });
  }, []);

  // 2) Pending 초깃값 불러오기
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

  // 3) Pending -> queue 간 1분마다 추가
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

  // 상세보기 → Accepted 로 이동
  const handleAcceptOrder = (order) => {
    const now = new Date();
    const accepted = {
      ...order,
      AcceptedDate: { $date: now.toISOString() },
    };
    setAcceptedOrders((prev) => [...prev, accepted]);
    setPendingOrders((prev) => prev.filter((o) => o !== order));
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => p + 1);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#2B2B30]">
      {/* 헤더 영역 */}
      <Header
        currentPage={currentPage}
        // columnsCount / 4열씩 보여주기
        totalPages={Math.ceil(columnsCount / 4)}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 bg-white dark:bg-[#2B2B30] p-4">
          {hasAcceptedOrders ? (
            <AcceptedOrderBoard
              orders={acceptedOrders}
              currentPage={currentPage}
              itemsPerPage={4}
              onColumnsChange={setColumnsCount}
            />
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
