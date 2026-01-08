export const copyToClipboard = async (text) => {
  try {
    // 1. 최신 브라우저 & HTTPS 환경 (표준 API)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // 2. HTTP 환경이거나 구형 브라우저 (Fallback)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('복사 실패');
      }
    }
    // 성공 시 true 반환 (선택 사항)
    return true;
    
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    // 실패 시 false 반환 또는 에러 throw
    throw err;
  }
};
