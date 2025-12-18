import React from 'react'
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  AtSign,
  CheckCircle,
  ShieldAlert,
  Moon,
} from 'lucide-react' // 아이콘 라이브러리 (사용 중인 것으로 대체 가능)
import ToggleItem from '../../components/profile/ToggleItem'
import SectionHeader from '../../components/profile/SectionHeader'
import { useToast } from '../../hooks/useToast'
import { useNotificationSettings } from '../../hooks/notification/useNotificationSettings'

export default function NotifyConfig() {
  const { showToast } = useToast()

  // 초기값 로딩, 업데이트 함수
  const { settings, updateSettings } = useNotificationSettings()

  // 토글 핸들러
  const handleToggle = (category, key) => {
    let newSettings = { ...settings }

    if (category === 'global') {
      newSettings[key] = !newSettings[key]
    } else {
      newSettings[category] = {
        ...newSettings[category],
        [key]: !newSettings[category][key],
      }
    }

    // API 호출 (자동 저장)
    updateSettings(newSettings)
  }

  const handleSave = async () => {
    // 명시적 피드백
    showToast('설정이 저장되었습니다.', 'success')
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-4xl space-y-8 p-8 pb-20">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">알림 설정</h1>
        <p className="mt-2 text-gray-500">
          Syncle에서 발생하는 이벤트에 대한 알림 수신 방식을 관리하세요.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        {/* 1. 방해 금지 모드 */}
        <div className="mb-8 border-b border-gray-300 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                <Moon size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  방해 금지 모드
                </h3>
                <p className="text-sm text-gray-500">
                  활성화하면 모든 알림을 받지 않습니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('global', 'dnd')}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${
                settings.dnd ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                  settings.dnd ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 설정 내용 컨테이너 (DND 켜지면 흐리게 처리) */}
        <div
          className={`transition-opacity duration-200 ${settings.dnd ? 'pointer-events-none opacity-50' : ''}`}
        >
          {/* 2. 이메일 알림 */}
          <SectionHeader
            icon={Mail}
            title="이메일 알림"
            description="중요한 소식을 메일로 받아보세요."
          />
          <div className="mb-8 pl-2">
            <ToggleItem
              label="초대 및 참여"
              subLabel="새로운 팀이나 보드에 초대되었을 때 알림"
              checked={settings.email.invites}
              onChange={() => handleToggle('email', 'invites')}
            />
            <ToggleItem
              label="멘션 (@User)"
              subLabel="댓글이나 카드 설명에서 내가 언급되었을 때"
              checked={settings.email.mentions}
              onChange={() => handleToggle('email', 'mentions')}
            />
            <ToggleItem
              label="작업 할당"
              subLabel="나에게 새로운 작업이 할당되었을 때"
              checked={settings.email.assignments}
              onChange={() => handleToggle('email', 'assignments')}
            />
            <ToggleItem
              label="프로젝트 뉴스레터"
              subLabel="NullPointer의 새로운 기능 업데이트 소식"
              checked={settings.email.updates}
              onChange={() => handleToggle('email', 'updates')}
            />
          </div>

          {/* 3. 인앱/실시간 알림 */}
          <SectionHeader
            icon={Bell}
            title="실시간 알림 (웹/푸시)"
            description="작업 중 발생하는 변경사항을 즉시 확인하세요."
          />
          <div className="pl-2">
            <ToggleItem
              label="나를 멘션함"
              checked={settings.push.mentions}
              onChange={() => handleToggle('push', 'mentions')}
            />
            <ToggleItem
              label="담당자 지정"
              checked={settings.push.assignments}
              onChange={() => handleToggle('push', 'assignments')}
            />
            <ToggleItem
              label="마감 기한 임박"
              subLabel="담당 카드의 마감 시간이 24시간 남았을 때"
              checked={settings.push.dueDates}
              onChange={() => handleToggle('push', 'dueDates')}
            />
            <ToggleItem
              label="모든 카드 상태 변경"
              subLabel="주의: 보드 내 모든 카드의 이동 알림을 받습니다 (알림 많음)"
              checked={settings.push.cardMoves}
              onChange={() => handleToggle('push', 'cardMoves')}
            />
          </div>
        </div>

        {/* 저장 버튼 (필요한 경우) */}
        <div className="mt-10 flex justify-end border-t border-gray-300 pt-6">
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
