export default function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs leading-normal text-gray-700">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}
