import { Eye, EyeOff } from 'lucide-react'
import React, { useState } from 'react'

export default function FormInput({
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  description,
  onCheck, // 중복 확인 핸들러
  isChecking, // 중복 확인 상태
  className = '', // 외부 스타일 주입
  children,
  ...props // 기타 속성
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

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
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:outline-none ${className} ${onCheck ? 'pr-20' : ''} ${getBorderColor()}`}
          {...props} // 나머지 속성 전달 (maxLength 등)
        />

        {/* 중복 확인 버튼 */}
        {onCheck && (
          <button
            type="button"
            onClick={onCheck}
            disabled={isChecking || !value}
            className={`absolute top-1/2 right-2 -translate-y-1/2 rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-300 ${isChecking || !value ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isChecking ? '확인 중..' : '중복확인'}
          </button>
        )}

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
