import React from 'react'

export default function AuthButton({ text, onClick, type = 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
    >
      {text}
    </button>
  )
}
