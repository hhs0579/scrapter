# 배포 가이드

## Firebase Hosting 배포

### 1. 사전 준비

Firebase CLI가 설치되어 있어야 합니다:
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인

```bash
firebase login
```

### 3. 프로젝트 확인

`.firebaserc` 파일에 프로젝트 ID가 설정되어 있는지 확인하세요.

### 4. 빌드 및 배포

#### 호스팅만 배포
```bash
npm run deploy
```

#### 전체 배포 (호스팅 + Firestore 규칙 + 인덱스)
```bash
npm run deploy:all
```

### 5. 수동 배포

빌드와 배포를 분리하여 실행할 수도 있습니다:

```bash
# 빌드만
npm run build

# 배포만
firebase deploy --only hosting
```

### 6. 환경 변수 설정

프로덕션 환경에서 사용할 환경 변수가 있다면, Firebase Hosting의 환경 변수 설정을 사용하거나, 빌드 시점에 환경 변수를 주입해야 합니다.

현재 `.env` 파일을 사용하는 경우, 빌드 전에 환경 변수를 설정하세요:

```bash
# .env.production 파일 생성 후
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... 기타 환경 변수

# 빌드
npm run build
```

### 7. Firestore 규칙 배포

Firestore 보안 규칙을 배포하려면:

```bash
firebase deploy --only firestore:rules
```

### 8. 문제 해결

#### 빌드 오류
- TypeScript 오류가 있다면 먼저 수정하세요
- `npm run build`로 빌드가 성공하는지 확인

#### 배포 오류
- Firebase 로그인이 되어 있는지 확인: `firebase login`
- 프로젝트가 올바르게 설정되어 있는지 확인: `firebase projects:list`
- `.firebaserc` 파일의 프로젝트 ID 확인

#### 화면이 안 보이는 경우
- `firebase.json`의 `public: "dist"` 설정 확인
- 빌드가 제대로 되었는지 `dist` 폴더 확인
- 브라우저 캐시 삭제 후 재시도



