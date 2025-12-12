import React, { useState } from 'react'
import {
  X,
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  SlidersHorizontal,
  Filter,
  Tag,
  Paperclip,
  AlignLeft,
  ArrowUpDown,
} from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

const BoardFilter = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('properties')
  const [keyword, setKeyword] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  // 정렬 상태 추가
  const [sortBy, setSortBy] = useState('newest')

  // --- 더미 데이터 영역 ---
  const priorities = [
    {
      value: 'HIGH',
      label: '높음',
      color: 'bg-red-100 text-red-700 border-red-200',
    },
    {
      value: 'MEDIUM',
      label: '보통',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    {
      value: 'LOW',
      label: '낮음',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
    },
  ]

  // [추가 1] 라벨 데이터
  const labels = [
    { id: 1, name: '디자인', color: 'bg-pink-500' },
    { id: 2, name: '개발', color: 'bg-indigo-500' },
    { id: 3, name: '기획', color: 'bg-emerald-500' },
    { id: 4, name: '버그', color: 'bg-red-500' },
  ]

  const dueDates = [
    {
      id: 'overdue',
      label: '마감일 지남',
      icon: AlertCircle,
      color: 'text-red-500',
    },
    {
      id: 'dueTomorrow',
      label: '내일 마감',
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      id: 'noDueDate',
      label: '마감일 없음',
      icon: Calendar,
      color: 'text-gray-400',
    },
    {
      id: 'completed',
      label: '완료됨',
      icon: CheckCircle2,
      color: 'text-green-500',
    },
  ]

  // [추가 2] 기타 속성 필터
  const extraAttributes = [
    { id: 'hasAttachments', label: '첨부파일 있음', icon: Paperclip },
    { id: 'hasDescription', label: '상세 설명 있음', icon: AlignLeft },
    {
      id: 'incompleteChecklist',
      label: '미완료 체크리스트',
      icon: CheckCircle2,
    },
  ]

  const members = [
    {
      id: 1,
      name: '김철수',
      email: 'kim@example.com',
      avatarColor: 'bg-emerald-500',
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      avatarColor: 'bg-blue-500',
    },
    // ... 기존 멤버 데이터
  ]
  // ---------------------

  return (
    <div className="absolute top-12 right-0 z-50 flex max-h-[85vh] w-96 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
      {/* 헤더 (동일) */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>필터</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 탭 버튼 (동일) */}
      <div className="flex shrink-0 border-b border-gray-100 px-4 pt-2">
        <button
          onClick={() => setActiveTab('properties')}
          className={`relative flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'properties' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          속성
          {activeTab === 'properties' && (
            <motion.div
              layoutId="activeTab"
              className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`relative flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'members' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          멤버
          {activeTab === 'members' && (
            <motion.div
              layoutId="activeTab"
              className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600"
            />
          )}
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'properties' ? (
            <motion.div
              key="properties"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* [추가 3] 정렬 옵션 (상단 배치) */}
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <label className="mb-2 flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <ArrowUpDown className="h-3 w-3" /> 정렬 기준
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="newest">최신 생성순</option>
                  <option value="oldest">오래된순</option>
                  <option value="priority_high">우선순위 높은순</option>
                  <option value="due_date">마감일 임박순</option>
                </select>
              </div>

              {/* 1. 키워드 검색 */}
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Search className="h-3 w-3" /> 키워드
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="제목으로 검색..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* [추가 1 적용] 라벨 필터 */}
              <div className="space-y-3">
                <label className="flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Tag className="h-3 w-3" /> 라벨
                </label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center rounded-lg p-1.5 transition-colors hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      라벨 없음
                    </span>
                  </label>
                  {labels.map((label) => (
                    <label
                      key={label.id}
                      className="flex cursor-pointer items-center rounded-lg p-1.5 transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div
                        className={`ml-2 flex h-6 w-full items-center rounded px-2 text-xs font-medium text-white ${label.color}`}
                      >
                        {label.name}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. 우선순위 (기존 동일) */}
              <div className="space-y-3">
                <label className="flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <SlidersHorizontal className="h-3 w-3" /> 우선순위
                </label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map((priority) => (
                    <label
                      key={priority.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold transition-all hover:opacity-80 ${priority.color}`}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded-sm border-current text-current focus:ring-0"
                      />
                      {priority.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* [추가 2 적용] 기타 속성 (첨부파일 등) */}
              <div className="space-y-3">
                <label className="flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Filter className="h-3 w-3" /> 상세 조건
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {extraAttributes.map((attr) => (
                    <label
                      key={attr.id}
                      className="group flex cursor-pointer items-center rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3 flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900">
                        <attr.icon className="h-4 w-4 text-gray-400" />
                        <span>{attr.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. 마감일 (기존 동일) */}
              <div className="space-y-3">
                <label className="flex items-center gap-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <Calendar className="h-3 w-3" /> 마감일
                </label>
                <div className="space-y-1">
                  {dueDates.map((option) => (
                    <label
                      key={option.id}
                      className="group flex cursor-pointer items-center rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3 flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900">
                        <option.icon className={`h-4 w-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            // 멤버 탭 (기존과 동일)
            <motion.div
              key="members"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* ... 멤버 필터 내용 ... */}
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="멤버 이름 검색..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                {/* 멤버 리스트 렌더링 로직 (기존 유지) */}
                {members.map((m) => (
                  <div key={m.id} className="flex items-center p-2">
                    {/* 더미 렌더링 */}
                    <div
                      className={`h-8 w-8 rounded-full ${m.avatarColor} flex items-center justify-center text-xs text-white`}
                    >
                      {m.name[0]}
                    </div>
                    <span className="ml-3 text-sm">{m.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 버튼 (동일) */}
      <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50 p-4">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-indigo-600">3개</span>의 필터 적용
          중
        </div>
        <div className="flex gap-2">
          <button className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700">
            초기화
          </button>
          <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700">
            필터 적용
          </button>
        </div>
      </div>
    </div>
  )
}

export default BoardFilter
