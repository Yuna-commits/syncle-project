import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import App from './App.jsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import 'react-toastify/dist/ReactToastify.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!GOOGLE_CLIENT_ID) {
  console.error('VITE_GOOGLE_CLIENT_ID 환경 변수가 설정되지 않음')
}

// 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // API 실패 시 1번만 재시도 (기본값은 3번)
      refetchOnWindowFocus: false, // 개발 중엔 창 전환 시 자동 재요청 끄는 게 편할 수 있음 (선택 사항)
    },
  },
})

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      {/* Provider로 감싸기 */}
      <QueryClientProvider client={queryClient}>
        <App />
        {/* 개발 도구 버튼 (배포 시에는 자동으로 사라짐) */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
)
