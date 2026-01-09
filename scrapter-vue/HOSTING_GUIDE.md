# 호스팅 가이드

이 문서는 Scrapter Vue 프로젝트를 Firebase Hosting에 배포하는 방법을 설명합니다.

## 사전 준비

### 1. Firebase CLI 설치

Firebase CLI가 설치되어 있지 않다면 설치하세요:

```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인

Firebase 계정으로 로그인합니다:

```bash
firebase login
```

브라우저가 열리면 Firebase 계정으로 로그인하세요.

### 3. Firebase 프로젝트 확인

현재 프로젝트가 올바르게 설정되어 있는지 확인:

```bash
firebase projects:list
```

프로젝트 ID는 `.firebaserc` 파일에 설정되어 있습니다 (현재: `scrapter-2`).

### 4. 환경 변수 설정 (중요!)

프로덕션 환경에서 사용할 환경 변수를 설정해야 합니다.

`scrapter-vue/` 폴더에 `.env.production` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=scrapter-2
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> **중요**: 실제 값으로 변경해야 합니다. Firebase 콘솔(https://console.firebase.google.com)에서 프로젝트 설정 > 일반 > 앱에서 확인할 수 있습니다.

## 배포 방법

### 방법 1: 간단한 배포 (권장)

`scrapter-vue` 폴더에서 다음 명령어를 실행하세요:

```bash
cd scrapter-vue
npm run deploy
```

이 명령어는 다음을 자동으로 수행합니다:
1. TypeScript 타입 체크
2. 프로덕션 빌드 (`vite build`)
3. Firebase Hosting에 배포

### 방법 2: 단계별 배포

빌드와 배포를 분리하여 실행할 수 있습니다:

```bash
# 1. 빌드만 실행
npm run build

# 2. 빌드 결과 확인 (선택사항)
# dist 폴더가 생성되었는지 확인

# 3. 배포만 실행
firebase deploy --only hosting
```

### 방법 3: 전체 배포 (호스팅 + Firestore)

호스팅과 Firestore 규칙/인덱스를 함께 배포:

```bash
npm run deploy:all
```

또는:

```bash
npm run build
firebase deploy
```

## 배포 후 확인

배포가 완료되면 다음과 같은 URL이 표시됩니다:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/scrapter-2/overview
Hosting URL: https://scrapter-2.web.app
```

브라우저에서 Hosting URL로 접속하여 사이트가 정상적으로 작동하는지 확인하세요.

## 커스텀 도메인 설정 (선택사항)

Firebase Hosting에 커스텀 도메인을 추가할 수 있습니다:

1. Firebase 콘솔 접속: https://console.firebase.google.com/project/scrapter-2/hosting
2. "도메인 추가" 버튼 클릭
3. 도메인 입력 및 인증 진행
4. DNS 레코드 추가 (Firebase가 제공하는 값)
5. SSL 인증서 자동 발급 대기

## 문제 해결

### 빌드 오류

#### TypeScript 오류
```bash
# 타입 체크만 실행
npm run build

# 오류가 있다면 먼저 수정
```

#### 빌드 파일 누락
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 다시 빌드
npm run build
```

### 배포 오류

#### Firebase 로그인 오류
```bash
# 다시 로그인
firebase logout
firebase login
```

#### 프로젝트 ID 오류
`.firebaserc` 파일 확인:
```json
{
  "projects": {
    "default": "scrapter-2"
  }
}
```

프로젝트 ID가 다른 경우, 올바른 ID로 변경하거나:
```bash
firebase use scrapter-2
```

#### 권한 오류
Firebase 콘솔에서 프로젝트에 대한 권한이 있는지 확인하세요.

### 배포 후 화면이 안 보이는 경우

1. **빌드 확인**: `dist` 폴더가 생성되었는지 확인
2. **firebase.json 확인**: `public: "dist"` 설정이 올바른지 확인
3. **브라우저 캐시**: 강력 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
4. **환경 변수**: `.env.production` 파일이 올바르게 설정되었는지 확인

### 환경 변수가 적용되지 않는 경우

1. `.env.production` 파일 확인
2. 환경 변수 앞에 `VITE_` 접두사가 있는지 확인
3. 빌드 후 `dist/assets/index-*.js` 파일에서 환경 변수가 포함되어 있는지 확인

## 배포 전 체크리스트

- [ ] Firebase CLI 설치 및 로그인 완료
- [ ] `.env.production` 파일 생성 및 환경 변수 설정
- [ ] Firebase 프로젝트 ID 확인 (`.firebaserc`)
- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] 로컬에서 `npm run preview`로 미리보기 확인
- [ ] Firestore 규칙 및 인덱스 확인 (필요시)

## 참고 사항

- 배포는 몇 분 정도 소요될 수 있습니다
- 배포 후 사이트가 즉시 반영되지 않을 수 있으니, 1-2분 대기 후 다시 시도하세요
- Firebase Hosting은 무료 플랜에서도 충분한 트래픽을 제공합니다
- HTTPS가 자동으로 활성화됩니다

## 추가 리소스

- [Firebase Hosting 문서](https://firebase.google.com/docs/hosting)
- [Firebase CLI 참조](https://firebase.google.com/docs/cli)
- [Vite 빌드 가이드](https://vitejs.dev/guide/build.html)

