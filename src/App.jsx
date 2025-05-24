import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import EmptyState from "./components/EmptyState";
import Toast from "./components/Toast";
import PendingOrderList from "./components/PendingOrderList";
import AcceptedOrderBoard from "./components/AcceptedOrders/AcceptedOrderBoard";
import ConfirmModal from "./components/ConfirmModal";

export default function App() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [queue, setQueue] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [columnsCount, setColumnsCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    target: null,
  });

  const hasAcceptedOrders = acceptedOrders.length > 0;

  // 1) 초기 Accepted 불러오기
  useEffect(() => {
    fetch("https://ct.pointda.com/api/kds/accepted")
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const updated = data.map((order) => ({
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
          triggerToast("접수가 들어왔습니다.");
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
      triggerToast("접수가 들어왔습니다.");
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

  // 조리 완료 확인 모달 띄우기
  const handleCompleteOrder = (order) => {
    setConfirmModal({ visible: true, target: order });
  };

  // 모달에서 '완료' 눌렀을 때 처리
  const confirmCompleteOrder = () => {
    const order = confirmModal.target;
    setAcceptedOrders((prev) =>
      prev.filter(
        (o) =>
          !(
            o.Address === order.Address &&
            o.Price === order.Price &&
            o.PGPrice === order.PGPrice &&
            o.AcceptedDate?.$date === order.AcceptedDate?.$date
          )
      )
    );
    setConfirmModal({ visible: false, target: null });
    triggerToast("조리가 완료되었습니다.");
  };

  const triggerToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => p + 1);

  // columnsCount 변경 시 currentPage 보정
  useEffect(() => {
    const totalPages = Math.ceil(columnsCount / 4);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [columnsCount, currentPage]);

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
              onColumnsChange={setColumnsCount}
              onComplete={handleCompleteOrder}
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
      <Toast visible={toast.visible} message={toast.message} />

      <ConfirmModal
        visible={confirmModal.visible}
        onCancel={() => setConfirmModal({ visible: false, target: null })}
        onConfirm={confirmCompleteOrder}
      />
    </div>
  );
}
