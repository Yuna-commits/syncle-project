export default function InfoItem({ label, value, icon }) {
  return (
    <div className="flex h-full items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
      {/* 아이콘 배경 및 색상 설정 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-sm">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="mb-1 text-xs font-medium text-gray-500">{label}</span>
        <span className="text-sm font-semibold break-all text-gray-700">
          {value}
        </span>
      </div>
    </div>
  )
}
