# ⏳ TaskFlow Focus

> **할 일 관리(To-Do)와 뽀모도로 타이머(Pomodoro Focus)가 결합된 모던 생산성 웹 애플리케이션**

---

## 🌟 주요 기능

1. **원클릭 뽀모도로 포커스 모드 (Zen Focus Mode)**
   - 25분 집중 + 5분 휴식 표준 뽀모도로 사이클
   - 몰입을 극대화하는 전체화면 타이머 & 원형 SVG 프로그레스 애니메이션
   - Web Audio API 기반의 편안한 차임벨 알림 사운드
   - 멀티태스킹을 위한 우측 하단 플로팅 미니 플레이어

2. **할 일 관리 (To-Do List)**
   - 빠른 할 일 추가, 인라인 수정, 완료 체크, 삭제
   - 스마트 필터 (`전체`, `오늘 할 일`, `중요`, `뽀모도로 진행 중`, `완료됨`)
   - 우선순위 (`High`, `Medium`, `Low`) 및 카테고리 태그 관리
   - 실시간 D-Day 계산 (`오늘 마감`, `내일 마감`, `D-2`, `마감 초과`)

3. **상세 메모 & 체크리스트**
   - 우측 슬라이드 서랍(Drawer)을 통한 세부 메모 및 하위 작업(Subtask) 관리

4. **데이터 영속성 & 테마**
   - 브라우저 `LocalStorage` 자동 동기화 (오프라인 100% 작동)
   - JSON 데이터 내보내기/가져오기 백업 지원
   - 다크 모드 & 라이트 모드 지원

---

## 🚀 실행 방법

별도의 설치나 빌드 과정 없이 `index.html` 파일을 브라우저에서 바로 열면 즉시 실행됩니다.

1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/thekhan83/todolist2.git
   ```
2. `index.html` 파일을 더블 클릭하여 웹 브라우저(Chrome, Edge 등)에서 실행합니다.

---

## 🛠 기술 스택

- **HTML5** (Semantic Markup)
- **Vanilla CSS** (Glassmorphism Design System, CSS Variables, Responsive)
- **JavaScript ES6+** (State Management, Web Audio API, Pomodoro State Machine)
- **Lucide Icons**
