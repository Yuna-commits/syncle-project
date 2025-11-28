import { Outlet } from 'react-router-dom'
import ProfileSidebar from '../components/profile/ProfileSidebar'

export default function ProfileLayout() {
  return (
    // h-screen: 화면 전체 높이 사용
    // overflow-hidden: 전체 스크롤 막음 (내부 스크롤 사용)
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* 사이드바 (고정) */}
      <div className="z-10 shrink-0">
        <ProfileSidebar />
      </div>

      {/* 메인 콘텐츠 영역: 남은 공간 차지 + 내부 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
