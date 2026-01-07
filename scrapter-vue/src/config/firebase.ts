import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";

// Firebase 설정
// 환경 변수에서 가져오거나 직접 설정
// 프로덕션 환경에서는 반드시 .env 파일을 사용하세요
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAlP3DSd4jNhMGBFU4I7kL-5Mk5umEhis0",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scrapter-2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scrapter-2",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "scrapter-2.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "41710125612",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:41710125612:web:e716654be7600b60084789",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4XFX2XYR4R",
};

// Firebase 앱 초기화 (중복 초기화 방지)
let app: FirebaseApp | undefined;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase 초기화 완료");
  } else {
    app = getApps()[0];
    console.log("Firebase 앱 재사용");
  }
} catch (error) {
  console.error("Firebase 앱 초기화 오류:", error);
  app = undefined;
}

// Firebase 서비스 초기화 (각 서비스를 개별적으로 처리)
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (app) {
  // Auth 서비스 초기화
  try {
    auth = getAuth(app);
    console.log("✅ Firebase Auth 초기화 완료");
  } catch (error) {
    console.warn("⚠️ Firebase Auth 초기화 실패:", error);
  }

  // Firestore 서비스 초기화
  try {
    db = getFirestore(app);
    console.log("✅ Firebase Firestore 초기화 완료");
  } catch (error) {
    console.warn(
      "⚠️ Firebase Firestore 초기화 실패 (Firebase 콘솔에서 활성화 필요):",
      error
    );
  }

  // Storage 서비스 초기화
  try {
    storage = getStorage(app);
    console.log("✅ Firebase Storage 초기화 완료");
  } catch (error) {
    console.warn(
      "⚠️ Firebase Storage 초기화 실패 (Firebase 콘솔에서 활성화 필요):",
      error
    );
  }
} else {
  console.warn(
    "⚠️ Firebase 앱이 초기화되지 않았습니다. 일부 기능이 제한될 수 있습니다."
  );
}

// 타입 안전성을 위해 non-null assertion이 필요한 경우 사용
export { auth, db, storage };
export default app;
