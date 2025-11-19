import React, { useState } from 'react'

export default function AuthInput({
  label,
  type = 'text',
  id,
  placeholder,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="mb-1.5 block text-left text-sm font-medium text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
        />
        {/* 비밀번호 토글 */}
        {isPassword && (
          <span
            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              // 비밀번호 보임
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5 text-gray-500"
              >
                {/* 눈 전체 윤곽 */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.317 4.5 12 4.5c4.683 0 8.577 3.01 9.964 7.183.07.207.07.432 0 .639C20.577 16.49 16.683 19.5 12 19.5c-4.683 0-8.577-3.01-9.964-7.178z"
                />
                {/* 눈동자 */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              // 비밀번호 숨김
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5 text-gray-500"
              >
                {/* 눈 전체 윤곽 */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.317 4.5 12 4.5c4.683 0 8.577 3.01 9.964 7.183.07.207.07.432 0 .639C20.577 16.49 16.683 19.5 12 19.5c-4.683 0-8.577-3.01-9.964-7.178z"
                />

                {/* 눈동자 */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />

                {/* Slash(빗금) */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18"
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
