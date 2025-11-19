import { Outlet } from 'react-router-dom'
import ProfileSidebar from '../components/profile/ProfileSidebar'

export default function ProfileLayout() {
  return (
    <div className="flex">
      {/* 왼쪽: Sidebar */}
      <ProfileSidebar />

      <div className="flex-1 p-6">
        {/* ProfilePage 렌더링 */}
        <Outlet />
      </div>
    </div>
  )
}
