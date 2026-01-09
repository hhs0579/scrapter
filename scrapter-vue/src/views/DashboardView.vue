<template>
  <div class="dashboard-view">
    <CommonHeader />
    <main class="dashboard-content page-enter">
      <div class="dashboard-layout">
        <!-- 왼쪽 사이드바 -->
        <aside class="dashboard-sidebar">
          <div class="user-info">
            <div class="user-avatar">
              <img
                v-if="userPhotoURL"
                :src="userPhotoURL"
                :alt="userNickname"
                class="avatar-image"
              />
              <span v-else class="material-icons">person</span>
            </div>
            <p class="greeting-text">안녕하세요</p>
            <p class="user-name">
              <span class="user-name-text">{{ userNickname }}</span>
              <span class="user-name-suffix"> 님</span>
            </p>
          </div>

          <button class="new-manuscript-button" @click="goToApp">
            새 원고 만들기
          </button>

          <router-link to="/" class="back-to-main"
            >메인페이지로 돌아가기</router-link
          >

          <nav class="sidebar-nav">
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <span class="material-icons">home</span>
              <span>대시보드</span>
            </router-link>
            <router-link
              to="/dashboard/manuscripts"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">description</span>
              <span>나의 원고함</span>
            </router-link>
            <router-link
              to="/dashboard/records"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">history</span>
              <span>기록</span>
            </router-link>
            <router-link
              to="/dashboard/inquiries"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">chat_bubble_outline</span>
              <span>문의사항</span>
            </router-link>
            <router-link
              to="/dashboard/settings"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">settings</span>
              <span>설정</span>
            </router-link>
          </nav>

          <button class="logout-button" @click="handleLogout">
            <span class="material-icons">logout</span>
            <span>로그아웃</span>
          </button>
        </aside>

        <!-- 오른쪽 메인 콘텐츠 -->
        <div class="dashboard-main">
          <h1 class="page-title">나의 원고함</h1>

          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>로딩 중...</p>
          </div>

          <div v-else-if="manuscripts.length === 0" class="empty-state">
            <p>저장된 원고가 없습니다.</p>
            <button class="new-manuscript-button" @click="goToApp">
              새 원고 만들기
            </button>
          </div>

          <div v-else class="manuscripts-list">
            <div
              v-for="manuscript in manuscripts"
              :key="manuscript.id"
              class="manuscript-item"
              :class="{ highlighted: manuscript.isHighlighted }"
            >
              <div class="manuscript-info">
                <div class="title-container">
                  <button
                    @click="startEditTitle(manuscript.id, manuscript.title)"
                    @mousedown.prevent
                    class="edit-title-button"
                    :title="editingTitleId === manuscript.id ? '취소' : '제목 수정'"
                  >
                    <span class="material-icons">{{
                      editingTitleId === manuscript.id ? "close" : "edit"
                    }}</span>
                  </button>
                  <h3 
                    v-if="editingTitleId !== manuscript.id"
                    class="manuscript-title"
                  >
                    {{ manuscript.title }}
                  </h3>
                  <input
                    v-else
                    v-model="editingTitle"
                    @keyup.enter="saveTitle(manuscript.id)"
                    @keyup.esc="cancelEditTitle"
                    @blur="handleBlur(manuscript.id)"
                    class="title-input"
                    :ref="el => { if (el) titleInputRef = el as HTMLInputElement }"
                    type="text"
                  />
                </div>
                <p class="manuscript-meta">
                  {{ formatDate(manuscript.createdAt) }} / {{ manuscript.type }}
                </p>
                <div class="manuscript-status">
                  <span
                    class="status-tag"
                    :class="{
                      'status-complete': manuscript.status === 'complete',
                      'status-generating': manuscript.status === 'generating',
                    }"
                  >
                    {{
                      manuscript.status === "complete"
                        ? "원고 생성 완료"
                        : "원고 생성 중"
                    }}
                  </span>
                  <span v-if="manuscript.validUntil" class="validity-period">
                    유효기간: {{ formatDate(manuscript.validUntil) }}
                  </span>
                </div>
              </div>
              <div class="manuscript-actions">
                <template v-if="!manuscript.isExpired">
                  <button
                    class="view-button"
                    @click="viewManuscript(manuscript.id)"
                  >
                    보기
                  </button>
                  <button
                    class="edit-button"
                    @click="editManuscript(manuscript.id)"
                  >
                    수정하기
                  </button>
                </template>
                <button v-else class="expired-button" disabled>
                  기간 만료
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../config/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

interface Manuscript {
  id: string;
  title: string;
  type: string;
  status: "complete" | "generating";
  createdAt: Date;
  validUntil: Date | null;
  isExpired: boolean;
  isHighlighted?: boolean;
}

const router = useRouter();
const manuscripts = ref<Manuscript[]>([]);
const isLoading = ref(false);
const userNickname = ref<string>("");
const userPhotoURL = ref<string>("");
const editingTitleId = ref<string | null>(null);
const editingTitle = ref<string>("");
const titleInputRef = ref<HTMLInputElement | null>(null);
const isCancelling = ref(false);

onMounted(async () => {
  // 로그인 확인
  if (!auth?.currentUser) {
    router.push("/login");
    return;
  }

  await loadUserInfo();
  await loadManuscripts();
});

const loadUserInfo = async () => {
  if (!auth?.currentUser || !db) return;

  try {
    // Firebase Auth에서 프로필 이미지 가져오기
    userPhotoURL.value = auth.currentUser.photoURL || "";

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userNickname.value =
        userData.nickname || auth.currentUser.displayName || "사용자";
      // Firestore에 이미지 URL이 저장되어 있으면 사용 (Google 로그인 시 photoURL이 있을 수 있음)
      if (userData.photoURL && !userPhotoURL.value) {
        userPhotoURL.value = userData.photoURL;
      }
    } else {
      userNickname.value = auth.currentUser.displayName || "사용자";
    }
  } catch (error) {
    console.error("사용자 정보 로드 오류:", error);
    userNickname.value = "사용자";
  }
};

const loadManuscripts = async () => {
  if (!auth?.currentUser || !db) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;

  try {
    const manuscriptsRef = collection(db, "manuscripts");
    const q = query(
      manuscriptsRef,
      where("userId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);

    manuscripts.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      const validUntil = data.validUntil?.toDate() || null;
      const now = new Date();
      const isExpired = validUntil ? validUntil < now : false;

      return {
        id: doc.id,
        title: data.title || "제목 없음",
        type: data.type || "회사소개서",
        status: data.status || "complete",
        createdAt,
        validUntil,
        isExpired,
        isHighlighted: false,
      };
    });

    // 클라이언트 측에서 날짜순 정렬 (최신순)
    manuscripts.value.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // 가장 최근 원고를 하이라이트
    if (manuscripts.value.length > 0 && manuscripts.value[0]) {
      manuscripts.value[0].isHighlighted = true;
    }
  } catch (error) {
    console.error("원고 목록 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const goToApp = () => {
  router.push("/app");
};

const viewManuscript = (id: string) => {
  // 세션 스토리지에 ID 저장 (URL에 노출되지 않음)
  sessionStorage.setItem("viewingManuscriptId", id);
  sessionStorage.removeItem("editingManuscriptId");
  router.push("/manuscript");
};

const editManuscript = (id: string) => {
  // 세션 스토리지에 ID 저장 (URL에 노출되지 않음)
  sessionStorage.setItem("editingManuscriptId", id);
  sessionStorage.removeItem("viewingManuscriptId");
  router.push("/manuscript");
};

const startEditTitle = async (id: string, currentTitle: string) => {
  if (editingTitleId.value === id) {
    // 이미 편집 중이면 취소
    isCancelling.value = true;
    cancelEditTitle();
    // 취소 후 다시 편집 모드로 들어가지 않도록 약간의 지연
    setTimeout(() => {
      isCancelling.value = false;
    }, 100);
    return;
  }
  
  editingTitleId.value = id;
  editingTitle.value = currentTitle;
  isCancelling.value = false;
  
  // 다음 틱에서 input에 포커스
  await nextTick();
  if (titleInputRef.value) {
    titleInputRef.value.focus();
    titleInputRef.value.select();
  }
};

const cancelEditTitle = () => {
  editingTitleId.value = null;
  editingTitle.value = "";
};

const handleBlur = (id: string) => {
  // 취소 중이면 blur 이벤트 무시
  if (isCancelling.value) {
    return;
  }
  
  // 약간의 지연을 주어 클릭 이벤트가 먼저 처리되도록 함
  setTimeout(() => {
    // 취소 버튼이 클릭되었거나 편집 모드가 아니면 저장하지 않음
    if (!isCancelling.value && editingTitleId.value === id) {
      saveTitle(id);
    }
  }, 150);
};

const saveTitle = async (id: string) => {
  if (!db || !editingTitleId.value || editingTitleId.value !== id) return;
  
  const newTitle = editingTitle.value.trim();
  
  // 제목이 비어있거나 변경사항이 없으면 취소
  if (!newTitle || newTitle === manuscripts.value.find(m => m.id === id)?.title) {
    cancelEditTitle();
    return;
  }
  
  try {
    const manuscriptRef = doc(db, "manuscripts", id);
    await updateDoc(manuscriptRef, {
      title: newTitle,
    });
    
    // 로컬 상태 업데이트
    const manuscript = manuscripts.value.find(m => m.id === id);
    if (manuscript) {
      manuscript.title = newTitle;
    }
    
    cancelEditTitle();
  } catch (error) {
    console.error("제목 수정 오류:", error);
    alert("제목 수정 중 오류가 발생했습니다.");
    cancelEditTitle();
  }
};

const handleLogout = async () => {
  if (!auth) return;

  try {
    await signOut(auth);
    // 세션 스토리지 초기화
    sessionStorage.clear();
    router.push("/");
  } catch (error) {
    console.error("로그아웃 오류:", error);
    alert("로그아웃 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.dashboard-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.dashboard-content {
  flex: 1;
  padding: 120px 0 80px;
}

.dashboard-layout {
  display: flex;

  margin: 0 auto;
  padding: 0 10%;
  gap: 40px;
}

.dashboard-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: fit-content;
  position: sticky;
  top: 120px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: var(--surface-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--primary-soft-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.user-avatar .material-icons {
  font-size: 32px;
  color: var(--primary-color);
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.greeting-text {
  font-size: 14px;
  color: var(--muted-text);
  margin: 0 0 4px 0;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.user-name-text {
  color: #ff7700;
}

.user-name-suffix {
  color: var(--text-strong);
}

.new-manuscript-button {
  width: 100%;
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.new-manuscript-button:hover {
  background-color: #e88d4f;
}

.back-to-main {
  color: var(--muted-text);
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  text-align: left;
  padding: 8px;
  transition: color 0.2s;
}

.back-to-main:hover {
  color: var(--primary-color);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 15px;
}

.sidebar-nav .nav-item:hover {
  background-color: var(--hover-bg);
}

.sidebar-nav .nav-item.active {
  background-color: var(--primary-soft-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.sidebar-nav .nav-item .material-icons {
  font-size: 20px;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-color);
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
  width: 100%;
  justify-content: flex-start;
}

.logout-button:hover {
  background-color: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
  color: #e74c3c;
}

.logout-button .material-icons {
  font-size: 20px;
}

.dashboard-main {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 32px 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state p {
  color: var(--muted-text);
  font-size: 16px;
}

.manuscripts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manuscript-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s;
}

.manuscript-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(255, 119, 0, 0.1);
}

.manuscript-item.highlighted {
  border: 2px dashed var(--primary-color);
  background-color: var(--primary-soft-bg);
}

.manuscript-info {
  flex: 1;
  min-width: 0;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.manuscript-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  flex: 1;
}

.title-input {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
  background-color: transparent;
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  padding: 4px 8px;
  outline: none;
  font-family: inherit;
}

.edit-title-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-text);
  transition: color 0.2s;
  opacity: 0.7;
}

.edit-title-button:hover {
  color: var(--primary-color);
  opacity: 1;
}

.edit-title-button .material-icons {
  font-size: 18px;
}

.title-container:hover .edit-title-button {
  opacity: 1;
}

.manuscript-meta {
  font-size: 14px;
  color: var(--muted-text);
  margin: 0 0 12px 0;
}

.manuscript-status {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-tag.status-complete {
  background-color: var(--primary-soft-bg);
  color: var(--primary-color);
}

.status-tag.status-generating {
  background-color: #fff3cd;
  color: #856404;
}

.validity-period {
  font-size: 13px;
  color: var(--muted-text);
}

.manuscript-actions {
  flex-shrink: 0;
  margin-left: 24px;
  display: flex;
  gap: 8px;
}

.view-button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-button:hover {
  background-color: #e88d4f;
}

.edit-button {
  padding: 10px 20px;
  background-color: var(--surface-bg);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button:hover {
  background-color: var(--primary-soft-bg);
}

.expired-button {
  padding: 10px 20px;
  background-color: var(--border-color);
  color: var(--muted-text);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
