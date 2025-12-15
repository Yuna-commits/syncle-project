export const mentionInputStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 1.5,
    minHeight: 44,
    borderRadius: '0.75rem',
    border: 'none',
  },

  '&multiLine': {
    control: {
      fontFamily: 'inherit',
      minHeight: 60,
    },
    highlighter: {
      padding: 12,
      border: '1px solid transparent',
      // 하이라이터 글씨는 투명하게 (입력창 글씨와 겹침 방지)
      color: 'transparent',
    },
    input: {
      padding: 12,
      border: '1px solid transparent',
      outline: 'none',
      color: '#374151',
    },
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      fontSize: 14,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      overflow: 'hidden',
    },
    item: {
      padding: '8px 12px',
      borderBottom: '1px solid #f3f4f6',
      '&focused': {
        backgroundColor: '#eff6ff',
        color: '#2563eb',
      },
    },
  },
}

export const mentionStyle = {
  backgroundColor: '#dbeafe', // blue-100 (연한 파란 배경)

  borderRadius: '4px',
  color: 'transparent', // 하이라이터의 글씨는 숨김 (입력창의 검은 글씨가 보임)
  fontWeight: 'inherit',
  padding: 0,
  margin: 0,
}
