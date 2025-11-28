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
  // 1. 기본 스타일 (공통)
  const baseStyle =
    'inline-flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 hover:cursor-pointer'

  // 2. 테마별 스타일 정의
  const variants = {
    primary:
      'bg-blue-500 text-white shadow-sm hover:bg-blue-600 focus:ring-blue-500',
    secondary:
      'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 focus:ring-gray-200',
    // 소셜 버튼용
    social:
      'bg-gray-100 text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 focus:ring-gray-200',
  }

  // 3. 비활성 스타일
  const disabledStyle =
    variant === 'primary'
      ? 'bg-blue-300 cursor-not-allowed'
      : 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'

  const finalClassName = `${baseStyle} ${isLoading || disabled ? disabledStyle : variants[variant]} ${className}`

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={finalClassName}
      {...props}
    >
      {isLoading ? (
        // 로딩 스피너
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 animate-spin text-current"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>처리 중...</span>
        </div>
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
