import { useEffect } from "react";
import AcceptedOrderCard from "./AcceptedOrderCard";

const SMALL_CARD = 494; // 작은카드
const BIG_CARD = 1008; // 큰 카드
const GAP = 32; // 본문과 버튼 사이의 여백
const BUTTON_HEIGHT = 56; // 조리완료 버튼의 높이

const HEADER_HEIGHT = 180; // 헤더(주문번호, 시간, 주소)의 고정 높이
const LINE_HEIGHT = 36; // 메뉴 옵션, 가격명 등 한 줄에 해당하는 높이

// 정확한 요청사항 텍스트의 높이를 계산하는 함수
function estimateRequestHeight(text, maxWidth = 350, font = "20px Pretendard") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;

  const words = text.trim().split(" ");
  let lineCount = 1;
  let currentLine = "";

  for (let word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const { width } = ctx.measureText(testLine);

    if (width > maxWidth) {
      lineCount++;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  return lineCount * LINE_HEIGHT;
}

// 하나의 주문을 작은 구성요소들로 나눔
function buildBlocks(order) {
  const blocks = [];
  blocks.push({ type: "header", height: HEADER_HEIGHT });

  order.MenuInfo.forEach((menu) => {
    const optCount = menu.Options?.length || 0; // 주문에 포함된 모든 메뉴 순회하면서
    const hasPriceOrOptions = menu.PriceName || optCount > 0; // 해당 메뉴의 옵션 개수, 가격명 등 존재여부 체크

    const lineCount = 1 + (menu.PriceName ? 1 : 0) + optCount;
    let height = lineCount * LINE_HEIGHT;

    // 옵션이나 가격명이 있을 경우, mb-3 + mb-4 = 28px 여백 추가
    if (hasPriceOrOptions) {
      height += 28;
    }

    blocks.push({ type: "menu", height, data: menu });
  });

  // 요청사항은 있는 경우에만 블록 추가
  if (
    order.Request?.Store &&
    order.Request.Store.trim() !== "요청사항 없어요!"
  ) {
    const dynamicHeight = estimateRequestHeight(order.Request.Store);

    blocks.push({
      type: "request",
      height: dynamicHeight,
      data: order.Request,
    });
  }

  // 본문과 버튼 사이의 여백 + "조리완료" 버튼 블록 추가
  blocks.push({ type: "gap", height: GAP });
  blocks.push({ type: "button", height: BUTTON_HEIGHT });

  return blocks;
}

// 각 주문을 실제 카드 크리에 맞게 자르는 함수
function splitOrdersIntoCards(orders) {
  const cards = []; // 결과적으로 쪼개진 카드들의 배열

  // 직전에 생성된 카드의 높이
  // SMALL_CARD(494)인지 BIG_CARD(1008)로 시작할지 결정
  let lastCardHeight = 0;
  let lastCardOrderIndex = -1;

  orders.forEach((order, orderIndex) => {
    const blocks = buildBlocks(order); // 주문을 블록 단위로 쪼갬
    let i = 0; // block의 인덱스

    while (i < blocks.length) {
      let cardBlocks = []; // 현재 카드에 들어갈 블록들을 담는 배열
      let sum = 0; // 현재 카드의 누적 높이

      let isContinuedOrder = lastCardOrderIndex === orderIndex;
      let max = isContinuedOrder
        ? BIG_CARD
        : lastCardHeight === SMALL_CARD
        ? SMALL_CARD
        : BIG_CARD;

      // 누적 높이(sum)이 카드 최대 크기(max)를 넘지 않는 한 계속 담음
      while (i < blocks.length && sum + blocks[i].height <= max) {
        cardBlocks.push(blocks[i]);
        sum += blocks[i].height;
        i++;
      }

      // 채운 블록들 높이 총합이 494px 이하이면 -> small
      // 그 이상이면 -> big
      const cardHeight = sum <= SMALL_CARD ? SMALL_CARD : BIG_CARD;
      const showHeader = cardBlocks.some((b) => b.type === "header");
      const menus = cardBlocks
        .filter((b) => b.type === "menu")
        .map((b) => b.data);
      const request = cardBlocks.find((b) => b.type === "request")?.data;
      const showButton =
        i === blocks.length && cardBlocks.some((b) => b.type === "button");

      // 카드 하나 완성 -> cards 배열에 넣음
      cards.push({
        orderIndex,
        order: { ...order, MenuInfo: menus, Request: request },
        showHeader,
        showButton,
        cardHeight,
      });

      // 다음 카드를 위한 기준으로 lastCardHeight, lastcardOrderIndex에 저장
      lastCardHeight = cardHeight;
      lastCardOrderIndex = orderIndex;
    }
  });

  return cards;
}

// 카드들을 레이아웃에 꽉 채우는 방식으로 배치하는 함수
function paginateCards(cards) {
  const pages = []; // 모든 페이지를 담는 배열
  let columns = [[], [], [], []]; // 현재 페이지의 4열
  let heights = [0, 0, 0, 0]; // 각 열의 누적 세로 높이

  // 모든 카드를 하나씩 돌면서, 어디열에 넣을 수 있을지 검사
  for (const card of cards) {
    let placed = false;
    for (let i = 0; i < 4; i++) {
      if (heights[i] + card.cardHeight <= BIG_CARD) {
        columns[i].push(card); // 그 열에 카드 넣고
        heights[i] += card.cardHeight; // 높이 누적
        placed = true;
        break;
      }
    }

    // 만약 4열이 모두 꽉 찼다면
    if (!placed) {
      pages.push(columns); // 현재 페이지 저장
      columns = [[], [], [], []]; // 새 페이지 열 준비
      heights = [0, 0, 0, 0]; // 새 페이지 높이 초기화
      columns[0].push(card); // 새 페이지의 첫 열에 현재 카드 넣음
      heights[0] = card.cardHeight;
    }
  }

  // 모든 카드 돌면서, 마지막 페이지에 남은 카드가 있다면 저장
  if (columns.some((col) => col.length > 0)) {
    pages.push(columns);
  }

  return pages;
}

export default function AcceptedOrderBoard({
  orders, // 모든 주문 목록
  currentPage, // 현재 보고 있는 페이지 번호
  onColumnsChange, // 전체 열 개수가 바뀔 때 호출되는 콜백
  onComplete, // 조리 완료 버튼 눌렀을 때 실행되는 함수
}) {
  // 주무 접수된 시간 순서대로 정렬 => 가장 오래된 게 먼저
  const sorted = [...orders].sort(
    (a, b) => new Date(a.AcceptedDate.$date) - new Date(b.AcceptedDate.$date)
  );

  // 정렬된 주문들을 카드 단위로 쪼갬(494 or 1008)
  const allCards = splitOrdersIntoCards(sorted);
  // 카드들을 페이지 단위로 나눔(한 페이지 -> 4열, 각 열은 최대 1008px)
  const pages = paginateCards(allCards);
  // 현재 페이지에서 보여줄 열 데이터 추출
  const currentColumns = pages[currentPage - 1] || [];

  // 페이지 수가 바뀔 때마다 열 개수를 onColumnsChange로 전달
  useEffect(() => {
    if (typeof onColumnsChange === "function") {
      onColumnsChange(pages.length * 4); // 한 페이지당 4열!
    }
  }, [pages.length, onColumnsChange]);

  return (
    <div className="flex flex-row gap-x-6">
      {/* 열 4개 생성 */}
      {currentColumns.map((col, ci) => (
        <div key={ci} className="flex-1 min-w-0 flex flex-col gap-y-[20px]">
          {col.map((card, ri) => (
            <AcceptedOrderCard
              key={`${card.orderIndex}-${ri}`} // 고유 키
              order={card.order} // 카드 안 주문 정보
              orderIndex={card.orderIndex + 1} // 주문번호(1부터 시작)
              showHeader={card.showHeader} // 헤더
              showButton={card.showButton} // 버튼
              cardHeight={card.cardHeight} // 카드 높이(494 or 1008)
              onComplete={() => onComplete(card.order)} // 버튼 눌렀을 때 처리
            />
          ))}
        </div>
      ))}
    </div>
  );
}
