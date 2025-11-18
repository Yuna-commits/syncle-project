import React from 'react'
import BoardCard from '../../components/common/BoardCard'
import CreateBoardButton from '../../components/common/CreateBoardButton'
// 1. 멤버 아바타를 위한 기본 이미지 import
import defaultProfile from '../../assets/images/default.png'

// ------------------------------------
// 가짜(Mock) 데이터 (팀 설명, 멤버 목록 추가)
// ------------------------------------
const teamData = {
  id: 'team-a',
  name: 'A Team',
  description: 'Frontend 개발을 담당하는 A팀입니다.',
  iconChar: 'T',
  iconColor: 'bg-green-500',
  boards: [
    {
      id: 'b-1',
      imageUrl: 'https://picsum.photos/400/200',
      title: 'A Team의 첫번째 보드',
    },
    {
      id: 'b-2',
      imageUrl: 'https://picsum.photos/400/200',
      title: 'A Team의 두번째 보드',
    },
  ],
  members: [
    { id: 1, name: '둘리', profile_img: defaultProfile },
    { id: 2, name: '또치', profile_img: defaultProfile },
    { id: 3, name: '희동이', profile_img: defaultProfile },
  ],
}

// ------------------------------------
// 메인 팀 보드 페이지 (기능 추가됨)
// ------------------------------------
function TeamBoardPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-5xl">
        {/* --- 1. 팀 헤더 (설명, 멤버/설정 버튼 추가) --- */}
        <section className="mb-10">
          <div className="flex items-start justify-between">
            {/* (왼쪽) 팀 정보 */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${teamData.iconColor} text-xl font-bold text-white`}
              >
                {teamData.iconChar}
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{teamData.name}</h1>
                {/* 팀 설명 렌더링 */}
                <p className="mt-1 text-sm text-gray-600">
                  {teamData.description}
                </p>
              </div>
            </div>

            {/* 👇 (오른쪽) 팀 나가기 버튼 (위치 이동) */}
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-600 hover:cursor-pointer hover:bg-gray-200">
              팀 나가기
            </button>
          </div>
        </section>

        {/* --- 2. 팀 멤버 섹션 (신규) --- */}
        <section className="mb-10">
          {/* 👇 (수정) 버튼이 이동되어 flex 컨테이너 제거, mb-3 원위치 */}
          <h2 className="mb-3 text-lg font-semibold">
            팀 멤버 ({teamData.members.length})
          </h2>

          <div className="flex items-center space-x-2">
            {/* 멤버 아바타 목록 */}
            {teamData.members.map((member) => (
              <img
                key={member.id}
                className="h-9 w-9 rounded-full ring-2 ring-white"
                src={member.profile_img}
                alt={member.name}
                title={member.name} // 마우스 호버 시 이름 표시
              />
            ))}
            {/* 초대 버튼 */}
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              +
            </button>
          </div>
        </section>

        {/* --- 3. 팀 보드 섹션 (기존) --- */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">{teamData.name}의 보드</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* API로 받아온 teamData의 보드 목록을 map으로 렌더링 */}
            {teamData.boards.map((board) => (
              <BoardCard
                key={board.id}
                imageUrl={board.imageUrl}
                title={board.title}
              />
            ))}
            <CreateBoardButton />
          </div>
        </section>
      </div>
    </main>
  )
}

export default TeamBoardPage
