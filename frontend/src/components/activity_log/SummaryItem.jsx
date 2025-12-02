import React from 'react'

export default function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 text-center shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}
