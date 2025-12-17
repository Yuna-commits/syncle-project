import { Loader2 } from 'lucide-react'
import React from 'react'

export default function FormButton({
  text,
  type = 'button',
  isLoading = false,
  disabled = false,
  variant = 'primary',
  icon = null,
  onClick,
  className = '',
  ...props
}) {
  // 1. 기본 스타일
  const baseStyle =
    'hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70'

  // 2. 변형(Variant) 스타일
  const variants = {
    primary:
      'bg-blue-500 text-white shadow-sm hover:bg-blue-600 focus:ring-blue-500',
    secondary:
      'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 focus:ring-gray-200',
    social:
      'bg-gray-100 text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 focus:ring-gray-200',
    danger:
      'bg-red-500 text-white shadow-sm hover:bg-red-600 focus:ring-red-500',
  }

  // 3. 상태에 따른 클래스 조합
  // isLoading이거나 disabled이면 클릭 방지 스타일 적용 (Tailwind의 disabled: 유틸리티 활용)
  const variantStyle = variants[variant] || variants.primary

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        // 로딩
        <>
          <Loader2 className="h-5 w-5 animate-spin text-current" />
          <span>처리 중...</span>
        </>
      ) : (
        // 정상 상태 (아이콘 + 텍스트)
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          <span>{text}</span>
        </>
      )}
    </button>
  )
}
