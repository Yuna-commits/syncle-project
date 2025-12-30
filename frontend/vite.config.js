import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 프로젝트 루트 경로에서 현재 모드에 맞는 .env 파일 로드
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0', // 외부 네트워크에서 IP로 접속 허용
      proxy: {
        // '/api'로 시작하는 요청이 오면 target으로 보냄
        '/api': {
          target: env.VITE_API_BASE_URL, // 백엔드 주소
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
