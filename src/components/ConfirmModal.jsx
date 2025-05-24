export default function ConfirmModal({ visible, onCancel, onConfirm }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-[#484850] rounded-2xl shadow-xl w-[720px] h-[492px] flex flex-col items-center justify-center text-center">
        <h2 className="text-[32px] font-bold mb-6 text-black dark:text-white">
          확인
        </h2>
        <p className="text-[24px] text-[black] dark:text-[white] mb-10">
          조리가 완료되었습니까?
        </p>
        <p className="text-[20px] text-[#878787] dark:text-[#BCBCBC] mb-14">
          완료 건은 주문내역에서 확인 가능합니다.
        </p>
        <div className="flex gap-6">
          <button
            onClick={onCancel}
            className="w-[300px] h-[120px] text-[24px] font-bold bg-[#E4E4E4] dark:bg-[#65656F] text-black dark:text-white rounded-2xl"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="w-[300px] h-[120px] text-[24px] font-bold bg-[#7566FF] text-white rounded-2xl"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
