import { Eye, EyeOff } from 'lucide-react'
import React, { useState } from 'react'

export default function FormInput({
  name,
  label,
  type = 'text',
  error,
  success,
  description,
  className = '', // 외부 스타일 주입
  children, // 타이머 등
  ...props // register에서 오는 ref, onChange, onBlur 등
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (error)
      return 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    if (success)
      return 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
    return 'border-gray-300 focus:border-blue-300 focus:ring-blue-500/20'
  }

  return (
    <div className="text-left">
      <label
        htmlFor={name}
        className="mb-1.5 block text-left text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          className={`block w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:ring-4 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${getBorderColor()} ${className}`}
          {...props} // 나머지 속성 전달 (maxLength 등)
        />

        {/* 비밀번호 토글 */}
        {isPassword && (
          <button
            type="button"
            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              // 비밀번호 보임
              <Eye size={20} className="text-gray-400" />
            ) : (
              // 비밀번호 숨김
              <EyeOff size={20} className="text-gray-400" />
            )}
          </button>
        )}

        {/* 추가 Children (ex. 타이머) */}
        {children}
      </div>

      {/* 메시지 출력 영역 (에러 우선) */}
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : success ? (
        <p className="mt-1 text-xs text-green-500">{success}</p>
      ) : description ? (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      ) : null}
    </div>
  )
}
