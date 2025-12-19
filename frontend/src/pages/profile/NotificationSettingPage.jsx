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

export default function NotificationSettingPage() {
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

    // API 호출
    updateSettings(newSettings)
  }

  const handleSave = async () => {
    // 명시적 피드백
    showToast('설정이 저장되었습니다.', 'success')
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-4xl space-y-6 p-6 pb-20">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">알림 설정</h1>
        <p className="mt-2 text-gray-500">
          Syncle에서 발생하는 이벤트에 대한 알림 수신 방식을 관리하세요.
        </p>
      </div>

      {/* 1. [Card] 방해 금지 모드 (완전히 분리된 카드) */}
      <div
        onClick={() => handleToggle('global', 'dnd')}
        className={`cursor-pointer rounded-2xl border px-4 py-5 shadow-sm transition-all duration-300 ${
          settings.dnd
            ? 'border-blue-200 bg-blue-50/60' // 켜짐: 푸른 배경 + 테두리
            : 'border-gray-300 bg-white' // 꺼짐: 흰 배경
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-xl p-2.5 transition-colors ${
                settings.dnd
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Moon
                size={22}
                strokeWidth={2.5}
                fill={settings.dnd ? 'currentColor' : 'none'}
              />
            </div>
            <div>
              <h3
                className={`text-lg font-bold ${
                  settings.dnd ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                방해 금지 모드
              </h3>
              <p
                className={`text-sm ${
                  settings.dnd ? 'text-blue-700/80' : 'text-gray-500'
                }`}
              >
                활성화하면 모든 알림을 받지 않습니다.
              </p>
            </div>
          </div>

          {/* DND 토글 스위치 */}
          <div
            className={`relative box-content h-6 w-11 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
              settings.dnd
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300 bg-gray-300 hover:border-gray-400 hover:bg-gray-400'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                settings.dnd ? 'translate-x-5.5' : 'translate-x-0.5'
              } mt-0.5`}
            />
          </div>
        </div>
      </div>

      {/* 2. [Card] 상세 설정 및 저장 (별도 카드) */}
      <div
        className={`rounded-2xl border border-gray-300 bg-white shadow-sm transition-all duration-300 ${
          settings.dnd ? 'pointer-events-none opacity-50 grayscale' : ''
        }`}
      >
        <div className="p-6">
          {/* 이메일 알림 */}
          <SectionHeader
            icon={Mail}
            title="이메일 알림 (초대/멘션)"
            description="접속해 있지 않을 때도 메일로 놓치지 않고 받아보세요."
          />
          <div className="mt-2 mb-8 grid gap-1 pl-2 lg:grid-cols-1">
            <ToggleItem
              label="팀/보드 초대"
              subLabel="새로운 팀이나 보드에 초대받았을 때"
              checked={settings.email.invites}
              onChange={() => handleToggle('email', 'invites')}
            />
            <ToggleItem
              label="나를 멘션함 (@User)"
              subLabel="댓글이나 본문에서 내가 직접 언급되었을 때"
              checked={settings.email.mentions}
              onChange={() => handleToggle('email', 'mentions')}
            />
            <ToggleItem
              label="담당자 지정"
              subLabel="내가 카드의 담당자로 지정되었을 때"
              checked={settings.email.assignments}
              onChange={() => handleToggle('email', 'assignments')}
            />
          </div>

          {/* 구분선 */}
          <hr className="mb-4 border-gray-200" />

          {/* 실시간 알림 */}
          <SectionHeader
            icon={Bell}
            title="실시간 알림 (웹/푸시)"
            description="작업 도중 발생하는 변경사항을 우측 상단 팝업으로 확인하세요."
          />
          <div className="mt-2 grid gap-1 pl-2 lg:grid-cols-1">
            <ToggleItem
              label="나를 멘션함 (@User)"
              subLabel="댓글이나 본문에서 내가 직접 언급되었을 때"
              checked={settings.push.mentions}
              onChange={() => handleToggle('push', 'mentions')}
            />
            <ToggleItem
              label="댓글 및 답글"
              subLabel="내 담당 카드나 내 댓글에 새로운 반응이 있을 때"
              checked={settings.push.comments}
              onChange={() => handleToggle('push', 'comments')}
            />
            <ToggleItem
              label="담당자 지정"
              subLabel="새로운 작업(카드)이 나에게 할당되었을 때"
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
              label="카드 상세 활동"
              subLabel="완료 처리, 파일 첨부, 체크리스트 등 상세 변경 내역"
              checked={settings.push.cardUpdates}
              onChange={() => handleToggle('push', 'cardUpdates')}
            />
            <ToggleItem
              label="카드 이동 (상태 변경)"
              subLabel="주의: 보드 내 모든 카드의 이동 알림을 받습니다 (알림 많음)"
              checked={settings.push.cardMoves}
              onChange={() => handleToggle('push', 'cardMoves')}
            />
          </div>
        </div>

        {/* 저장 버튼 (카드 하단에 통합) */}
        <div className="flex justify-end rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={handleSave}
            disabled={settings.dnd}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:cursor-pointer hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}
