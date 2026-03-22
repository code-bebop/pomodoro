# Pomodoro Timer — Development Guidelines

## Overview

뽀모도로 타이머 PWA. React + TypeScript 단일 페이지 앱. 백엔드 없음, localStorage로 상태 관리.

## Tech Stack

- **Language**: TypeScript 5.x (strict mode)
- **Framework**: React 19+
- **Build**: Vite 6+ with vite-plugin-pwa (Workbox)
- **Testing**: Vitest + React Testing Library + happy-dom
- **Deployment**: GitHub Pages (static, base path: `/pomodoro/`)
- **Package Manager**: npm

## Project Structure

```
src/
├── components/     # React 컴포넌트 (Timer, Controls, ModeSelector, CycleIndicator, Settings)
├── hooks/          # 커스텀 훅 (useTimer, useNotification, useLocalStorage)
├── types/          # 공유 타입 정의
├── constants.ts    # 기본값, 상수
├── App.tsx         # 루트 컴포넌트
├── main.tsx        # 엔트리포인트
└── index.css       # 글로벌 스타일

tests/              # 소스 구조를 미러링
├── hooks/
├── components/
└── integration/

specs/              # speckit 설계 문서
public/             # PWA 아이콘, 알림 사운드
```

## Commands

```bash
npm run dev       # 개발 서버 (localhost:5173/pomodoro/)
npm run build     # 프로덕션 빌드 → dist/
npm run test      # 모든 테스트 실행
npm run test:watch # 테스트 와치 모드
```

## Constitution (핵심 원칙)

1. **TDD (NON-NEGOTIABLE)** — 테스트 먼저, Red-Green-Refactor
2. **Minimal UI** — 목적 없는 UI 요소 금지
3. **PWA-First** — 오프라인, 설치 가능
4. **Simplicity (YAGNI)** — 필요 없으면 만들지 않기

상세: `.specify/memory/constitution.md`

## Key Technical Decisions

- **타이머 정확도**: `Date.now()` wall-clock 비교 (setInterval 드리프트 방지)
- **상태 저장**: localStorage에 절대 종료 시간(endTime) 저장 → 리로드 시 정확한 잔여 시간 복원
- **멀티탭**: BroadcastChannel API로 단일 타이머 인스턴스 보장
- **디바이스 슬립**: visibilitychange 이벤트로 복구

## Known Issues

- Node 25의 built-in localStorage가 happy-dom과 충돌 → tests/setup.ts에서 폴리필 처리
- PWA 아이콘이 1x1 placeholder PNG (교체 필요)
- notification.mp3가 빈 파일 (교체 필요)
- `npm install` 시 `--legacy-peer-deps` 필요할 수 있음

## Speckit Workflow

새 기능 추가: `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
