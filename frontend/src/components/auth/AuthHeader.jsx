import React from 'react'

export default function AuthHeader({ title, subtitle }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="mb-2 text-3xl font-semibold text-gray-800">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}
