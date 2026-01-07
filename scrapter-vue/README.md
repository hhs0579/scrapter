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

## Firebase 연결하기

### 1단계: Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 후 생성

### 2단계: 웹 앱 등록

1. Firebase 프로젝트 대시보드에서 웹 아이콘(</>) 클릭
2. 앱 닉네임 입력 (예: "scrapter-vue")
3. "앱 등록" 클릭
4. Firebase SDK 설정 값 복사 (또는 나중에 프로젝트 설정에서 확인)

### 3단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**설정 값 찾는 방법:**
- Firebase 콘솔 > 프로젝트 설정 (톱니바퀴 아이콘) > 일반 탭
- "내 앱" 섹션에서 웹 앱 선택
- "SDK 설정 및 구성" 섹션에서 `firebaseConfig` 객체의 값들을 복사

### 4단계: Firebase 서비스 활성화

필요한 Firebase 서비스를 콘솔에서 활성화하세요:

- **Authentication**: 사용자 인증 (이메일/비밀번호, Google 등)
- **Firestore Database**: NoSQL 데이터베이스
- **Storage**: 파일 저장소

### 5단계: 사용하기

Firebase가 이미 설정되어 있으므로, 다른 컴포넌트에서 다음과 같이 사용할 수 있습니다:

```typescript
import { auth, db, storage } from '@/config/firebase';

// 인증 예시
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);

// Firestore 예시
import { collection, addDoc } from 'firebase/firestore';
await addDoc(collection(db, 'users'), { name: 'John' });

// Storage 예시
import { ref, uploadBytes } from 'firebase/storage';
const storageRef = ref(storage, 'images/photo.jpg');
await uploadBytes(storageRef, file);
```

## 다음 단계

- ✅ Firebase 설정 완료
- Firebase 인증 구현
- Firestore 데이터베이스 연동
- 이미지 업로드 및 스토리지 연동
- Google Sign-In 통합
