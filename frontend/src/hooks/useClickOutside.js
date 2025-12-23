import { useEffect } from 'react'

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // ref가 없거나, 클릭된 요소가 ref 내부에 있다면 무시
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      // 외부 클릭 시 핸들러 실행
      handler(event)
    }

    document.addEventListener('click', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('click', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

export default useClickOutside
