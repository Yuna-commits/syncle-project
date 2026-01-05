export const getRoleLabel = (role) => {
  switch (role) {
    case 'OWNER':
      return '관리자'
    case 'MEMBER':
      return '팀원'
    case 'VIEWER':
      return '뷰어'
    default:
      return role
  }
}
