# Scrapter

Scrapter 프로젝트는 Vue.js 랜딩 페이지와 Flutter Web 앱으로 구성된 멀티 플랫폼 프로젝트입니다.

## 프로젝트 구조

```
scrapter/
├─ scrapter-vue/        # 랜딩 페이지 (Vue 3 + TypeScript + Vite)
├─ scrapter-flutter/    # 실서비스 (Flutter Web)
└─ hosting/             # Firebase Hosting
   ├─ dist/             # 실제 배포되는 정적 파일
   ├─ firebase.json
   └─ .firebaserc
```

## 시작하기

### Vue 랜딩 페이지 개발

```bash
cd scrapter-vue
npm install
npm run dev
```

### Flutter 앱 개발

```bash
cd scrapter-flutter
flutter pub get
flutter run -d chrome
```

### 빌드 및 배포

```bash
cd hosting
npm install
npm run deploy
```

자세한 배포 방법은 [hosting/README.md](./hosting/README.md)를 참고하세요.

## 기능

- **랜딩 페이지**: Vue.js로 구현된 모던한 랜딩 페이지
- **Flutter Web 앱**: Flutter로 구현된 메인 애플리케이션
- **Firebase Hosting**: 통합 배포 환경

## 기술 스택

### Vue 랜딩 페이지
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Firebase

### Flutter 앱
- Flutter
- Provider (상태 관리)
- Go Router
- Firebase (Core, Auth, Firestore, Storage)
- Google Sign-In


