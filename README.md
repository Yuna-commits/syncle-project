# Syncle (싱클) - 실시간 협업 프로젝트 관리 플랫폼

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.5.7-green)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7.0-purple)

**Syncle**은 팀원 간의 효율적인 업무 공유와 소통을 위한 **실시간 칸반(Kanban) 기반 협업 툴**입니다.<br>
드래그 앤 드롭을 통한 직관적인 업무 관리, 웹소켓을 이용한 실시간 동기화, 그리고 멘션 및 알림 기능을 통해 끊김 없는 협업 환경을 제공합니다.

---

## 🚀 Key Features (핵심 기능)

* **👥 팀 & 워크스페이스**: 팀 생성 및 멤버 초대, 권한 관리 (Owner/Member/Viewer)
* **📊 칸반 보드 (Kanban Board)**: 리스트 및 카드의 **Drag & Drop** 이동 및 정렬 (SortableJS)
* **⚡ 실시간 동기화**: WebSocket(STOMP)을 활용하여 다른 사용자의 작업 내역이 즉시 화면에 반영
* **💬 소통 & 알림**: 댓글 작성, `@멘션` 기능, 실시간 알림 센터
* **📅 일정 관리**: 캘린더 뷰를 통한 마감일 및 일정 확인 (FullCalendar)
* **📁 파일 관리**: AWS S3를 연동한 파일 첨부 및 이미지 업로드
* **🔐 보안**: JWT 기반 인증, Spring Security, Google OAuth 로그인 지원

---

## 🛠 Tech Stack (기술 스택)

### Backend
| Category | Technology |
| --- | --- |
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.5.7 |
| **Database** | MariaDB, Redis (Cache & Session) |
| **ORM** | MyBatis 3.0.5 |
| **Security** | Spring Security, JWT |
| **Infra** | AWS EC2, AWS RDS, AWS S3 |
| **Build** | Maven |

### Frontend
| Category | Technology |
| --- | --- |
| **Framework** | React 19, Vite |
| **State Mgt** | Zustand, React Query (TanStack Query) |
| **Styling** | Tailwind CSS, Framer Motion |
| **Library** | Axios, StompJS, SortableJS, React Mentions |

---

## 📂 Project Structure

```bash
syncle-project
├── backend                     # Spring Boot Server
│   ├── src/main/java           # Java Source Code
│   └── src/main/resources      # Config & Mappers
└── frontend                    # React Client
    ├── src                     # Components, Pages, Hooks
    └── public                  # Static Assets
