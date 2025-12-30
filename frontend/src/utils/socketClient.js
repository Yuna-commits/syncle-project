import { Client } from '@stomp/stompjs'

// 앱 전역에서 공유되는 유일한 클라이언트 인스턴스
let client = null

export const socketClient = {
  // 연결 함수
  // 백엔드 소켓 인터셉터가 동작하기 위해 HTTP 헤더에 토큰 담아서 전송
  connect: (config) => {
    // 이미 연결되어 있어도 토큰(헤더)이 바뀌었으면 재연결
    const newAuth = config?.headers?.Authorization
    const currentAuth = client?.connectHeaders?.Authorization

    if (client && client.active) {
      if (newAuth === currentAuth) return // 토큰이 같으면 유지
      client.deactivate() // 다르면 재연결
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const socketURL = baseURL.replace(/^http/, 'ws') + '/ws'

    client = new Client({
      brokerURL: socketURL, // 백엔드 WebSocket 주소
      reconnectDelay: 5000, // 연결 끊기면 5초 뒤 재연결 시도
      connectHeaders: config?.headers || {},
      onConnect: config.onConnect,
      onStompError: config.onStompError,
      ...config, // 외부에서 콜백 주입
    })

    client.activate()
  },

  // 구독 함수
  subscribe: (destination, callback) => {
    if (client && client.connected) {
      return client.subscribe(destination, callback)
    }
    return null
  },

  // 메시지 전송 함수
  publish: (destination, body) => {
    if (client && client.connected) {
      client.publish({ destination, body: JSON.stringify(body) })
    }
  },

  // 연결 해제 (앱 종료 시에만 호출)
  disconnect: () => {
    if (client) {
      client.deactivate()
      client = null
    }
  },

  // 현재 클라이언트 객체 반환
  getClient: () => client,

  // 연결 상태 확인
  isConnected: () => client && client.connected,
}
