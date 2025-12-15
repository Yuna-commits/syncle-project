import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 현재 선택된 옵션의 라벨 찾기
  const selectedLabel = useMemo(() => {
    if (!value) return placeholder
    const found = options.find((opt) => String(opt.value) === String(value))
    return found ? found.label : placeholder
  }, [value, options, placeholder])

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex min-w-[180px] items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
          disabled
            ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
            : 'cursor-pointer border-gray-200 bg-white text-gray-700 shadow-sm hover:border-blue-500 hover:text-blue-600'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && !disabled && (
        <div className="ring-opacity-5 absolute top-full left-0 z-50 mt-1 max-h-60 w-full min-w-[180px] overflow-auto rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black">
          <div className="flex flex-col gap-0.5">
            {/* '전체' 또는 '초기화' 옵션 */}
            <button
              type="button"
              onClick={() => handleOptionClick('')}
              className={`flex items-center justify-between rounded-md border-gray-100 px-2 py-2 text-left text-sm ${
                value === ''
                  ? 'bg-blue-50 font-semibold text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{placeholder}</span>
              {value === '' && <Check size={14} />}
            </button>

            {/* 개별 옵션들 */}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`flex items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${
                  String(value) === String(option.value)
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {String(value) === String(option.value) && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomSelect
