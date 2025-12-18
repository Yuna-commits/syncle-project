import { toast } from 'react-toastify'

export const useToast = () => {
  // TODO) NotifyConfig 와 연결

  const showToast = (message, type = 'info') => {
    const toastConfig = {
      info: {
        text: 'text-blue-600',
        bar: '!bg-blue-600',
        hex: '#3b82f6', // blue-500 Hex
      },
      success: {
        text: 'text-green-600',
        bar: '!bg-green-600',
        hex: '#22c55e', // green-500 Hex
      },
      error: {
        text: 'text-red-600',
        bar: '!bg-red-600',
        hex: '#ef4444', // red-500 Hex
      },
      warn: {
        text: 'text-amber-600',
        bar: '!bg-amber-600',
        hex: '#f59e0b',
      },
    }

    const config = toastConfig[type] || toastConfig.info

    // 2. 옵션 적용
    const options = {
      // 배경은 흰색(bg-white), 텍스트는 진한 색, 그림자와 둥근 모서리
      className: `bg-white ${config.text} text-sm font-medium rounded-lg shadow-lg border border-gray-100`,

      // 진행 바 색상 강제 적용
      progressClassName: config.bar,

      // 기본 아이콘 색상을 바꾸기 위해 CSS 변수 오버라이딩
      style: {
        '--toastify-color-info': config.hex,
        '--toastify-color-success': config.hex,
        '--toastify-color-error': config.hex,
        '--toastify-color-warning': config.hex,
      },
    }

    // 3. 실행
    if (toast[type]) {
      toast[type](message, options)
    } else {
      toast.info(message, options)
    }
  }
  return { showToast }
}
