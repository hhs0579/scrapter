# Firestore에 Gemini API 키 저장하기

## 📋 개요

이제 Gemini API 키는 Firestore에서 가져옵니다. 이렇게 하면:
- ✅ API 키를 코드에 노출하지 않음
- ✅ 중앙에서 API 키 관리 가능
- ✅ 키 변경 시 코드 수정 불필요

## 🔧 Firestore에 API 키 저장하기

### 방법 1: Firebase 콘솔에서 직접 설정 (권장)

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com 접속
   - 프로젝트 선택 (scrapter-2)

2. **Firestore Database 열기**
   - 좌측 메뉴에서 "Firestore Database" 클릭
   - "데이터" 탭 확인

3. **컬렉션 및 문서 생성**
   - "컬렉션 시작" 또는 "+ 컬렉션 추가" 클릭
   - 컬렉션 ID: `config`
   - 문서 ID: `geminiApiKey`
   - 필드 추가:
     - 필드: `key` (또는 `apiKey`)
     - 유형: `string`
     - 값: `AIzaSyCBvl_qyp0NQqOyAdI_AiL8bQAViEqn_SI` (새로운 API 키)

4. **저장**
   - "저장" 버튼 클릭

### 방법 2: Firebase CLI로 설정

```bash
# Firebase CLI로 Firestore에 문서 추가
firebase firestore:set config/geminiApiKey '{ "key": "AIzaSyCBvl_qyp0NQqOyAdI_AiL8bQAViEqn_SI" }'
```

### 방법 3: 코드로 설정 (개발용)

⚠️ **주의**: 이 방법은 개발 중에만 사용하고, 프로덕션에서는 Firestore 콘솔에서 직접 설정하세요.

```typescript
import { db } from './config/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function setApiKey() {
  if (!db) return;
  
  await setDoc(doc(db, 'config', 'geminiApiKey'), {
    key: 'AIzaSyCBvl_qyp0NQqOyAdI_AiL8bQAViEqn_SI'
  });
  
  console.log('API 키가 Firestore에 저장되었습니다.');
}
```

## 📁 Firestore 문서 구조

```
config (컬렉션)
  └── geminiApiKey (문서 ID)
      └── key (필드): "AIzaSyCBvl_qyp0NQqOyAdI_AiL8bQAViEqn_SI"
```

또는

```
config (컬렉션)
  └── geminiApiKey (문서 ID)
      └── apiKey (필드): "AIzaSyCBvl_qyp0NQqOyAdI_AiL8bQAViEqn_SI"
```

코드는 `key` 또는 `apiKey` 필드를 자동으로 찾습니다.

## 🔐 보안 규칙

현재 Firestore 규칙:
- ✅ 인증된 사용자는 `config` 컬렉션을 **읽을 수 있음**
- ❌ 코드에서는 **쓰기 불가** (보안상 Firestore 콘솔에서만 설정)

## ✅ 확인 방법

1. **Firebase 콘솔에서 확인**
   - Firestore Database > 데이터 탭
   - `config/geminiApiKey` 문서가 있는지 확인
   - `key` 또는 `apiKey` 필드에 값이 있는지 확인

2. **앱에서 확인**
   - 앱 실행 후 원고 생성 시도
   - 브라우저 콘솔에서 오류 없이 작동하는지 확인

## 🔄 API 키 변경하기

API 키를 변경하려면:
1. Firebase 콘솔에서 `config/geminiApiKey` 문서 열기
2. `key` 또는 `apiKey` 필드 값 변경
3. 저장

앱은 다음 요청 시 자동으로 새 키를 사용합니다. (캐시 초기화 필요 시 앱 재시작)

## 🛠️ 문제 해결

### API 키를 찾을 수 없다는 오류가 발생하는 경우

1. **Firestore에 문서가 있는지 확인**
   - 컬렉션 이름: `config`
   - 문서 ID: `geminiApiKey`

2. **필드 이름 확인**
   - `key` 또는 `apiKey` 필드가 있어야 함

3. **Firestore 규칙 확인**
   - 인증된 사용자가 읽을 수 있는지 확인

4. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

### 환경 변수와 Firestore 우선순위

앱은 다음 순서로 API 키를 찾습니다:
1. ✅ 환경 변수 (`VITE_GEMINI_API_KEY`) - 가장 우선
2. ✅ Firestore (`config/geminiApiKey`)

환경 변수가 설정되어 있으면 Firestore를 읽지 않습니다.


