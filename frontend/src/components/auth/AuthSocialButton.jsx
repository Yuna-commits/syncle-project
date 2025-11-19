import React from 'react'

export default function SocialLoginButton({ text, icon }) {
  return (
    <div>
      <button className="inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-gray-100 px-7 py-3 text-sm text-gray-700 shadow-sm hover:cursor-pointer hover:bg-gray-200">
        <img src={icon} alt={text} className="h-5 w-5" /> {text}
      </button>
    </div>
  )
}
