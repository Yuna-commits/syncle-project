import React, { Children } from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-100 p-8 text-center sm:p-10 lg:p-12">
      <div className="mx-auto w-full max-w-md rounded-xl border border-gray-300 bg-white p-8 shadow-sm">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 sm:p-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
