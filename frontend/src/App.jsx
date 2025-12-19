import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify'

export default function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false} // 시간이 줄어드는 진행 바 숨김 여부
        newestOnTop={false} // 새 알람의 쌓이는 순서(false: 아래로 쌓임)
        closeOnClick
        rtl={false} // Right-to-Left 텍스트 방향 사용 여부
        pauseOnFocusLoss // 브라우저 창에서 포커스가 벗어나면 멈춤
        draggable={false} // 드래그로 알림 제거 여부
        pauseOnHover // 마우스를 올렸을 때 타이머 멈춤
        theme="light"
        limit={3} // 최대 3개만 보여줌
      />
    </>
  )
}
