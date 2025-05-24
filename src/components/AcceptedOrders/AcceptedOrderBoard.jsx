import { useEffect } from "react";
import AcceptedOrderCard from "./AcceptedOrderCard";

// 카드 높이 상수
const SMALL_CARD = 494;
const BIG_CARD = 1008;
const GAP = 32;
const BUTTON_HEIGHT = 56;

// 콘텐츠(line) 단위 계산용
const HEADER_HEIGHT = 180;
const LINE_HEIGHT = 36;
const REQUEST_LINES = 3;
const REQUEST_HEIGHT = REQUEST_LINES * LINE_HEIGHT;

// 1) 헤더·메뉴·요청사항을 블록으로 분해
function buildBlocks(order) {
  const blocks = [];
  blocks.push({ type: "header", height: HEADER_HEIGHT });

  order.MenuInfo.forEach((menu) => {
    const optCount = menu.Options?.length || 0;
    const lineCount = 1 + (menu.PriceName ? 1 : 0) + optCount;
    blocks.push({
      type: "menu",
      height: lineCount * LINE_HEIGHT,
      data: menu,
    });
  });

  if (
    order.Request?.Store &&
    order.Request.Store.trim() !== "요청사항 없어요!"
  ) {
    blocks.push({
      type: "request",
      height: REQUEST_HEIGHT,
      data: order.Request,
    });
  }

  return { blocks, hasReq: blocks.some((b) => b.type === "request") };
}

// 2) 한 장(BIG_CARD) 분량만큼 블록을 묶어서 청크로 분할
function splitIntoChunks(order) {
  const { blocks, hasReq } = buildBlocks(order);
  const chunks = [];
  let curr = [];
  let currH = 0;

  blocks.forEach((blk, idx) => {
    const isLast = idx === blocks.length - 1;
    const contentH =
      currH + blk.height + (isLast && hasReq ? REQUEST_HEIGHT : 0);
    const fullH = contentH + BUTTON_HEIGHT + GAP;

    if (fullH > BIG_CARD) {
      if (curr.length === 0) {
        chunks.push([blk]);
      } else {
        chunks.push(curr);
        curr = [blk];
      }
      currH = blk.height;
    } else {
      curr.push(blk);
      currH += blk.height;
    }
  });

  if (curr.length) chunks.push(curr);
  return { chunks, hasReq };
}

// 3) 청크 별로 카드 props 형태로 가공
function makeCardData(order) {
  const { chunks, hasReq } = splitIntoChunks(order);

  return chunks.map((blkList, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === chunks.length - 1;

    const menus = blkList.filter((b) => b.type === "menu").map((b) => b.data);

    const request = isLast && hasReq ? order.Request : null;

    const sumH = blkList.reduce((s, b) => s + b.height, 0);
    const total = sumH + BUTTON_HEIGHT + GAP;

    const cardHeight = total <= SMALL_CARD ? SMALL_CARD : BIG_CARD;

    return {
      order: { ...order, MenuInfo: menus, Request: request },
      showHeader: isFirst,
      showButton: isLast,
      cardHeight,
    };
  });
}

// 4) AcceptedOrderBoard 컴포넌트
export default function AcceptedOrderBoard({
  orders,
  currentPage,
  itemsPerPage,
  onColumnsChange,
  onComplete,
}) {
  // 시간순 정렬
  const sorted = [...orders].sort(
    (a, b) => new Date(a.AcceptedDate.$date) - new Date(b.AcceptedDate.$date)
  );

  // 카드 데이터 생성
  const allCards = sorted.flatMap((o) => makeCardData(o));

  // 컬럼 쌓기 (BIG_CARD 기준)
  const columns = [[]];
  let colH = 0;
  allCards.forEach((c) => {
    if (colH + c.cardHeight > BIG_CARD) {
      columns.push([]);
      colH = 0;
    }
    columns[columns.length - 1].push(c);
    colH += c.cardHeight + GAP;
  });

  // 컬럼 수를 App.jsx에 전달
  useEffect(() => {
    if (typeof onColumnsChange === "function") {
      onColumnsChange(columns.length);
    }
  }, [columns.length, onColumnsChange]);

  // 페이징: 한 페이지당 itemsPerPage개의 열
  const pageCols = columns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  let globalOrderIndex = 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {pageCols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-y-8">
          {col.map((c, cj) => {
            const card = (
              <AcceptedOrderCard
                key={cj}
                order={c.order}
                orderIndex={globalOrderIndex}
                showHeader={c.showHeader}
                showButton={c.showButton}
                cardHeight={c.cardHeight}
                onComplete={() => onComplete(c.order)}
              />
            );
            globalOrderIndex++;
            return card;
          })}
        </div>
      ))}
    </div>
  );
}
