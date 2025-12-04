import React from 'react'

function RadioOption({
  value,
  label,
  desc,
  icon: Icon,
  checked,
  onChange,
  disabled,
}) {
  return (
    <>
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
          checked
            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
            : 'border-gray-200 hover:bg-gray-50'
        } ${disabled && 'cursor-not-allowed opacity-75 hover:bg-white'}`}
      >
        <input
          type="radio"
          name="visibility"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="mt-1"
        />
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Icon size={14} /> {label}
          </div>
          <p className="mt-1 text-xs text-gray-500">{desc}</p>
        </div>
      </label>
    </>
  )
}

export default RadioOption
