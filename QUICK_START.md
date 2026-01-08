# 빠른 시작 가이드

## 웹 미리보기

### 가장 쉬운 방법 (권장)

```bash
cd hosting
npm install
npm run preview
```

브라우저에서 `http://localhost:5000` 접속

### 단계별 실행

1. **의존성 설치**
   ```bash
   cd hosting
   npm install
   ```

2. **빌드**
   ```bash
   npm run build
   ```

3. **파일 복사**
   ```bash
   npm run copy:vue
   npm run copy:flutter
   ```

4. **미리보기**
   - Firebase 에뮬레이터 사용: `npm run serve` (포트 5000)
   - 로컬 서버 사용: `npm run serve:local` (포트 8000)

## 개발 모드

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

## 배포

```bash
cd hosting
# .firebaserc에서 프로젝트 ID 설정 후
npm run deploy
```






