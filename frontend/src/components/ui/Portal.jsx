import ReactDOM from 'react-dom'

const Portal = ({ children }) => {
  // DOM 트리 최상단 body로 탈출
  const el = document.getElementById('portal-root') || document.body
  return ReactDOM.createPortal(children, el)
}

export default Portal
