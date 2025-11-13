import React, { Children } from 'react'

export default function AuthLayout({ children }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-100">
      <div className="mx-auto w-full max-w-md rounded-xl border border-gray-300 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
