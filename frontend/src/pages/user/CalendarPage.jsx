import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

function CalendarPage() {
  const myEventsList = [
    {
      id: '1',
      title: 'DB ERD 설계 회의',
      start: '2025-11-18T10:00:00',
      end: '2025-11-18T12:00:00',
    },
    {
      id: '2',
      title: '로그인 UI 디자인 마감, 전체 팀 리뷰',
      start: '2025-11-19', // YYYY-MM-DD 형식은 'allDay: true'로 간주됨
      backgroundColor: '#ef4444', // Tailwind 색상 대신 hex 코드로도 가능
      borderColor: '#ef4444',
    },
    {
      id: '3',
      title: '주간 스프린트',
      start: '2025-11-17',
      end: '2025-11-21',
      // Tailwind 클래스로 직접 스타일링 가능!
      classNames: ['bg-blue-500', 'border-blue-700', 'text-white'],
    },
  ]
  return (
    <main className="flex flex-1 flex-col overflow-hidden p-8">
      <div className="mx-auto w-full max-w-7xl flex-1 bg-white">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
          }}
          initialView="dayGridMonth"
          events={myEventsList} // 이벤트 데이터
          editable={true} // 이벤트 드래그/리사이즈
          selectable={true} // 날짜 선택
          dayMaxEvents={true} // 하루에 표시할 최대 이벤트 수
          height="100%"
        />
      </div>
    </main>
  )
}

export default CalendarPage
