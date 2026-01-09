# Gemini API 키 설정 가이드

## 문제 상황
기존 API 키가 유출되어 사용할 수 없게 되었습니다. 새로운 API 키를 설정해야 합니다.

## 새로운 API 키 발급 방법

1. **Google AI Studio 접속**
   - https://aistudio.google.com/app/apikey 에 접속
   - Google 계정으로 로그인

2. **API 키 생성**
   - "Create API Key" 버튼 클릭
   - 프로젝트 선택 (없으면 새로 생성)
   - API 키가 생성되면 복사

3. **API 키 설정**
   - 프로젝트 루트에 `.env` 파일 생성 (이미 있으면 수정)
   - 다음 내용 추가:
     ```
     VITE_GEMINI_API_KEY=복사한_API_키_여기에_붙여넣기
     ```
   
4. **개발 서버 재시작**
   - 환경 변수 변경 후 개발 서버를 재시작해야 합니다:
     ```bash
     # 개발 서버 중지 후
     npm run dev
     ```

## 중요 사항

- ⚠️ **`.env` 파일은 절대 Git에 커밋하지 마세요!**
  - `.gitignore`에 이미 포함되어 있지만, 확인해주세요.
- 🔒 **API 키 보안**
  - API 키를 코드에 직접 작성하지 마세요.
  - 공유 저장소나 코드에 API 키를 노출하지 마세요.
  - 유출된 키는 즉시 Google AI Studio에서 삭제하세요.

## 문제 해결

### API 키를 설정했는데도 작동하지 않는 경우
1. `.env` 파일이 프로젝트 루트(`scrapter-vue/`)에 있는지 확인
2. `VITE_` 접두사가 붙어있는지 확인 (Vite 환경 변수 필수)
3. 개발 서버를 재시작했는지 확인
4. `.env` 파일의 문법 오류 확인 (따옴표 없이 직접 입력)

### API 키 제한 설정
Google AI Studio에서 API 키의 사용 제한을 설정할 수 있습니다:
- API 키 생성 후 "API key restrictions"에서 설정
- IP 주소, HTTP 리퍼러 등으로 제한 가능


