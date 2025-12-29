# Scrapter Hosting

Firebase Hosting을 위한 빌드 및 배포 설정입니다.

## 프로젝트 구조

```
scrapter/
├─ scrapter-vue/        # 랜딩 페이지 (Vue)
├─ scrapter-flutter/    # 실서비스 (Flutter Web)
└─ hosting/             # Firebase Hosting
   ├─ dist/             # 실제 배포되는 정적 파일
   ├─ firebase.json
   └─ .firebaserc
```

## 빌드 및 배포

### 1. 의존성 설치

```bash
cd hosting
npm install
```

### 2. Firebase 프로젝트 설정

`.firebaserc` 파일에서 프로젝트 ID를 설정하세요:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 3. 빌드

```bash
# Vue와 Flutter 모두 빌드
npm run build

# 또는 개별 빌드
npm run build:vue      # Vue 랜딩 페이지 빌드
npm run build:flutter  # Flutter Web 앱 빌드
```

### 4. 파일 복사

```bash
npm run copy:vue      # Vue 빌드 결과를 dist/에 복사
npm run copy:flutter  # Flutter 빌드 결과를 dist/app/에 복사
```

### 5. 배포

```bash
# 빌드 + 복사 + 배포 (한 번에)
npm run deploy

# 또는 Firebase CLI 직접 사용
firebase deploy --only hosting
```

## 라우팅

- `/` - Vue 랜딩 페이지
- `/app/` - Flutter Web 앱

## 로컬 미리보기

### 방법 1: Firebase Hosting 에뮬레이터 (권장)

빌드와 미리보기를 한 번에 실행:

```bash
npm run preview
```

또는 단계별로 실행:

```bash
# 1. 빌드
npm run build

# 2. 파일 복사
npm run copy:vue
npm run copy:flutter

# 3. Firebase 에뮬레이터 실행
npm run serve
```

브라우저에서 `http://localhost:5000` 접속

### 방법 2: 로컬 HTTP 서버

```bash
# 빌드 및 복사
npm run build
npm run copy:vue
npm run copy:flutter

# 로컬 서버 실행
npm run serve:local
```

브라우저에서 `http://localhost:8000` 접속

### 방법 3: Vite Preview (Vue만)

Vue 랜딩 페이지만 미리보기:

```bash
cd ../scrapter-vue
npm run build
npm run preview
```

## 빠른 미리보기 명령어

```bash
# 한 번에 빌드 + 복사 + 미리보기
npm run preview
```
