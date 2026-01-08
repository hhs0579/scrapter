# 핫 리로드 가이드

## 핫 리로드가 작동하는 방법

Vue + Vite는 기본적으로 **핫 리로드(HMR - Hot Module Replacement)**를 지원합니다.

## 올바른 실행 방법

### ✅ 개발 서버 (핫 리로드 지원)

```bash
cd scrapter-vue
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

- 파일을 수정하면 **자동으로 브라우저가 업데이트**됩니다
- 페이지 새로고침 없이 변경사항이 즉시 반영됩니다
- 상태(state)가 유지됩니다

### ❌ 프리뷰 서버 (핫 리로드 없음)

```bash
npm run build
npm run preview
```

이 방법은:
- 빌드된 정적 파일을 서빙합니다
- **핫 리로드가 없습니다**
- 파일을 수정하려면 다시 빌드해야 합니다

## 핫 리로드가 작동하지 않을 때

1. **브라우저 새로고침**: `Cmd+R` (Mac) 또는 `Ctrl+R` (Windows)
2. **하드 새로고침**: `Cmd+Shift+R` (Mac) 또는 `Ctrl+Shift+R` (Windows) - 캐시 무시
3. **개발 서버 재시작**:
   ```bash
   # Ctrl+C로 중지 후
   npm run dev
   ```
4. **브라우저 개발자 도구 확인**: 콘솔에 에러가 있는지 확인
5. **올바른 URL 확인**: `http://localhost:5173`인지 확인 (`http://localhost:4173`이 아닌지)

## 개발 vs 프리뷰

| 기능 | `npm run dev` | `npm run preview` |
|------|---------------|-------------------|
| 핫 리로드 | ✅ 지원 | ❌ 없음 |
| 빠른 시작 | ✅ 즉시 | ⚠️ 빌드 필요 |
| 프로덕션 최적화 | ❌ 없음 | ✅ 최적화됨 |
| 용도 | 개발 중 | 배포 전 최종 확인 |

## 권장 워크플로우

1. **개발 중**: `npm run dev` 사용
2. **배포 전 테스트**: `npm run build && npm run preview` 사용
3. **실제 배포**: `hosting` 폴더에서 빌드 및 배포





