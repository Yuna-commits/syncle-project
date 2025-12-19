import { Outlet } from 'react-router-dom'
import { useGlobalSocket } from '../hooks/useGlobalSocket'

const GlobalSocketWrapper = () => {
  // 전역 소켓 연결
  // 항상 ProtectedRoute 내부에 위치 -> 항상 로그인된 상태 보장
  useGlobalSocket()

  return <Outlet />
}

export default GlobalSocketWrapper
