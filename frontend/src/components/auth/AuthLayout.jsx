import React, { Children } from 'react'

export default function AuthLayout({ children }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-100 p-8 text-center sm:p-10 lg:p-12">
      <div className="mx-auto w-full max-w-md rounded-xl border border-gray-300 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
