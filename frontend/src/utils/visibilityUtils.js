export const getVisibilityLabel = (visibility) => {
  switch (visibility) {
    case 'PRIVATE':
      return '비공개'
    case 'PUBLIC':
      return '전체 공개'
    default:
      return visibility
  }
}
