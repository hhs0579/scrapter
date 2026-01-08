# 이미지 및 폰트 관리 가이드

## 기본 원칙

각 프로젝트(scrapter-vue, scrapter-flutter)는 **독립적으로 빌드**되므로, 필요한 리소스를 각각 관리해야 합니다.

## 프로젝트별 리소스 위치

### 1. Vue 프로젝트 (scrapter-vue)

#### 정적 파일 (이미지, 아이콘 등)
```
scrapter-vue/
└── public/          # 빌드 시 그대로 복사됨
    ├── images/      # 이미지 파일들
    └── icons/       # 아이콘 파일들
```

사용 방법:
```vue
<template>
  <img src="/images/logo.png" alt="Logo" />
</template>
```

#### 빌드 시 처리되는 파일 (폰트 등)
```
scrapter-vue/
└── src/
    └── assets/      # import 해서 사용
        └── fonts/   # 폰트 파일들
```

사용 방법:
```vue
<script setup>
import fontUrl from '@/assets/fonts/Pretendard-Regular.otf'
</script>

<style>
@font-face {
  font-family: 'Pretendard';
  src: url('@/assets/fonts/Pretendard-Regular.otf');
}
</style>
```

### 2. Flutter 프로젝트 (scrapter-flutter)

```
scrapter-flutter/
└── assets/
    ├── fonts/       # 폰트 파일들
    ├── images/      # 이미지 파일들
    └── icons/       # 아이콘 파일들
```

`pubspec.yaml`에 등록 필요:
```yaml
flutter:
  assets:
    - assets/images/
    - assets/icons/
  fonts:
    - family: Pretendard
      fonts:
        - asset: assets/fonts/Pretendard-Regular.otf
```

## 권장 방법

### 방법 1: 각 프로젝트에 별도 관리 (권장)

**장점:**
- 각 프로젝트가 완전히 독립적
- 빌드 설정이 단순함
- 프로젝트별로 필요한 리소스만 포함

**단점:**
- 리소스 중복 가능
- 업데이트 시 여러 곳 수정 필요

### 방법 2: 공유 리소스 폴더 + 빌드 스크립트

공유 리소스를 만들어 빌드 시 복사:

```
scrapter/
├── shared-assets/      # 공유 리소스
│   ├── fonts/
│   ├── images/
│   └── icons/
├── scrapter-vue/
└── scrapter-flutter/
```

빌드 스크립트에서 복사하도록 설정 가능합니다.

### 방법 3: CDN 사용

공통 리소스를 CDN에 배포하고 두 프로젝트에서 모두 사용

**장점:**
- 중복 없음
- 캐싱 효율적

**단점:**
- 네트워크 필요
- 초기 설정 복잡

## 실용적인 접근

1. **공통 브랜드 리소스** (로고, 아이콘 등)
   - 각 프로젝트에 복사하여 관리
   - 버전 관리로 동기화

2. **프로젝트별 리소스**
   - 각 프로젝트에서 필요한 것만 관리

3. **폰트 파일**
   - 각 프로젝트에 복사 (Flutter와 Vue에서 사용 방식이 다름)

## 예시: Pretendard 폰트 추가

### Vue 프로젝트에 추가

```bash
# 폰트 파일 복사
mkdir -p scrapter-vue/src/assets/fonts
cp scrapter-flutter/assets/fonts/Pretendard-*.otf scrapter-vue/src/assets/fonts/
```

`scrapter-vue/src/style.css` 또는 `App.vue`에 추가:
```css
@font-face {
  font-family: 'Pretendard';
  src: url('./assets/fonts/Pretendard-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}
```

### Flutter 프로젝트는 이미 설정되어 있음

`pubspec.yaml`에 이미 Pretendard 폰트가 등록되어 있습니다.





