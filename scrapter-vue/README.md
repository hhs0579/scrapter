# Scrapter Vue

Vue 3 + TypeScript + Vite로 만든 Scrapter 프로젝트입니다.

## 기술 스택

- **Vue 3** - 프론트엔드 프레임워크
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 환경 및 빌드 도구
- **Vue Router** - 라우팅
- **Pinia** - 상태 관리
- **Firebase** - 백엔드 서비스 (설치됨, 설정 필요)

## 프로젝트 구조

```
scrapter_vue/
├── src/
│   ├── stores/          # Pinia 상태 관리 스토어
│   │   ├── theme.ts     # 테마 관리 (다크모드/라이트모드)
│   │   └── counter.ts   # 카운터 상태 관리
│   ├── views/           # 페이지 컴포넌트
│   │   └── HomeView.vue # 메인 홈 페이지
│   ├── components/      # 재사용 가능한 컴포넌트
│   ├── router/          # Vue Router 설정
│   │   └── index.ts
│   ├── App.vue          # 루트 컴포넌트
│   └── main.ts          # 애플리케이션 진입점
├── public/              # 정적 파일
└── package.json
```

## 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 미리보기

```bash
npm run preview
```

## 주요 기능

- ✅ 다크모드/라이트모드 테마 전환
- ✅ 카운터 기능 (증가/감소/리셋)
- ✅ Vue Router를 통한 라우팅
- ✅ Pinia를 통한 상태 관리

## 다음 단계

Flutter 프로젝트와 동일한 기능을 구현하기 위해 다음 기능들을 추가할 수 있습니다:

- Firebase 인증 설정
- Firestore 데이터베이스 연동
- 이미지 업로드 및 스토리지 연동
- Google Sign-In 통합
