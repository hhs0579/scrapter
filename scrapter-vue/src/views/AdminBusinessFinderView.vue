<template>
  <div class="admin-business-finder-view">
    <CommonHeader />
    <main class="admin-content">
      <div class="admin-container">
        <!-- 글 목록 뷰 -->
        <div v-if="!showCreateForm" class="admin-list-view">
          <div class="admin-header">
            <h1 class="page-title">비즈니스 파인더 관리</h1>
            <div class="header-actions">
              <button @click="showCreateForm = true" class="create-button">
                글작성
              </button>
              <button @click="handleLogout" class="logout-button">
                로그아웃
              </button>
            </div>
          </div>

          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>로딩 중...</p>
          </div>
          <div v-else-if="projects.length === 0" class="empty-state">
            <p>작성된 글이 없습니다.</p>
            <button @click="showCreateForm = true" class="create-button">
              첫 글 작성하기
            </button>
          </div>
          <div v-else class="projects-list">
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-item"
              @click="editProject(project)"
            >
              <div class="project-info">
                <span class="project-organization">{{ project.organization }}</span>
                <h3 class="project-title">{{ project.title }}</h3>
                <p class="project-meta">
                  {{ formatDate(project.date) }}
                  <span v-if="project.condition"> · {{ project.condition }}</span>
                </p>
              </div>
              <button
                @click.stop="deleteProject(project.id)"
                class="delete-button"
                :disabled="isDeleting === project.id"
              >
                {{ isDeleting === project.id ? "삭제 중..." : "삭제" }}
              </button>
            </div>
          </div>
        </div>

        <!-- 글 작성/수정 폼 -->
        <div v-else class="admin-form-view">
          <div class="admin-header">
            <h1 class="page-title">
              {{ editingProject ? "글 수정" : "글 작성" }}
            </h1>
            <button @click="cancelEdit" class="cancel-button">취소</button>
          </div>

          <form @submit.prevent="handleSubmit" class="admin-form">
            <div class="form-group">
              <label for="organization">주최 기관 *</label>
              <input
                id="organization"
                v-model="formData.organization"
                type="text"
                required
                class="form-input"
                placeholder="예: 중소벤처기업부, 인천테크노파크"
              />
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1">
                <label for="title">제목 *</label>
                <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  required
                  class="form-input"
                  placeholder="지원사업 제목을 입력하세요"
                />
              </div>
              <div class="form-group" style="width: 200px">
                <label for="date">날짜 *</label>
                <input
                  id="date"
                  v-model="formData.date"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="condition">조건 *</label>
              <input
                id="condition"
                v-model="formData.condition"
                type="text"
                required
                class="form-input"
                placeholder="예: 3년이내 창업자"
              />
            </div>

            <div class="form-group">
              <label for="content">내용 *</label>
              <textarea
                id="content"
                v-model="formData.content"
                required
                class="form-textarea"
                rows="5"
                placeholder="지원사업에 대한 상세 내용을 입력하세요"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="link">지원사업 링크 (선택)</label>
              <input
                id="link"
                v-model="formData.link"
                type="url"
                class="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="handleReset" class="reset-button">
                초기화
              </button>
              <button
                type="submit"
                class="submit-button"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? "저장 중..." : "저장하기" }}
              </button>
            </div>

            <p v-if="submitError" class="error-message">{{ submitError }}</p>
            <p v-if="submitSuccess" class="success-message">
              {{ submitSuccess }}
            </p>
          </form>
        </div>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../config/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

interface BusinessProject {
  id: string;
  organization: string;
  title: string;
  date: Date;
  condition: string;
  content: string;
  link?: string;
  createdAt: Date;
}

const router = useRouter();
const showCreateForm = ref(false);
const editingProject = ref<BusinessProject | null>(null);
const formData = ref({
  organization: "",
  title: "",
  date: "",
  condition: "",
  content: "",
  link: "",
});
const projects = ref<BusinessProject[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(false);
const isDeleting = ref<string | null>(null);
const submitError = ref("");
const submitSuccess = ref("");

// 어드민 로그인 확인
const checkAdminAuth = async () => {
  if (!auth || !db) {
    router.push("/admin/login");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    router.push("/admin/login");
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      router.push("/admin/login");
      return;
    }

    const userData = userDoc.data();
    const nickname = userData?.nickname;

    if (nickname !== "admin") {
      await signOut(auth);
      router.push("/admin/login");
      return;
    }
  } catch (error) {
    console.error("어드민 인증 확인 오류:", error);
    router.push("/admin/login");
  }
};

onMounted(async () => {
  await checkAdminAuth();
  await loadProjects();
});

const loadProjects = async () => {
  if (!db) {
    console.error("Firestore가 초기화되지 않았습니다.");
    return;
  }

  isLoading.value = true;
  try {
    const projectsRef = collection(db, "businessFinder");
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    projects.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        organization: data.organization || "",
        title: data.title || "",
        date: data.date?.toDate() || new Date(),
        condition: data.condition || "",
        content: data.content || "",
        link: data.link || "",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("지원사업 로드 오류:", error);
    submitError.value = "지원사업을 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const editProject = async (project: BusinessProject) => {
  editingProject.value = project;
  formData.value = {
    organization: project.organization,
    title: project.title,
    date: formatDateForInput(project.date),
    condition: project.condition,
    content: project.content,
    link: project.link || "",
  };
  showCreateForm.value = true;
};

const cancelEdit = () => {
  const hasChanges =
    formData.value.organization ||
    formData.value.title ||
    formData.value.date ||
    formData.value.condition ||
    formData.value.content ||
    formData.value.link;

  if (hasChanges) {
    if (confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
      showCreateForm.value = false;
      editingProject.value = null;
      handleReset();
    }
  } else {
    showCreateForm.value = false;
    editingProject.value = null;
    handleReset();
  }
};

const handleSubmit = async () => {
  if (!db) {
    submitError.value = "Firestore가 초기화되지 않았습니다.";
    return;
  }

  isSubmitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

  try {
    const projectData: any = {
      organization: formData.value.organization,
      title: formData.value.title,
      date: formData.value.date ? new Date(formData.value.date) : new Date(),
      condition: formData.value.condition,
      content: formData.value.content,
      link: formData.value.link || null,
      updatedAt: serverTimestamp(),
    };

    if (editingProject.value) {
      await updateDoc(
        doc(db, "businessFinder", editingProject.value.id),
        projectData
      );
      submitSuccess.value = "글이 성공적으로 수정되었습니다!";
    } else {
      projectData.createdAt = serverTimestamp();
      await addDoc(collection(db, "businessFinder"), projectData);
      submitSuccess.value = "글이 성공적으로 저장되었습니다!";
    }

    handleReset();
    await loadProjects();
    setTimeout(() => {
      showCreateForm.value = false;
      editingProject.value = null;
    }, 1000);
  } catch (error: any) {
    console.error("저장 오류:", error);
    const errorMessage = error?.message || error?.code || "알 수 없는 오류";
    submitError.value = `저장 중 오류가 발생했습니다: ${errorMessage}`;
  } finally {
    isSubmitting.value = false;
  }
};

const handleReset = () => {
  formData.value = {
    organization: "",
    title: "",
    date: "",
    condition: "",
    content: "",
    link: "",
  };
  submitError.value = "";
  submitSuccess.value = "";
};

const deleteProject = async (id: string) => {
  if (!db) return;
  if (!confirm("정말 삭제하시겠습니까?")) return;

  isDeleting.value = id;
  try {
    await deleteDoc(doc(db, "businessFinder", id));
    await loadProjects();
  } catch (error) {
    console.error("삭제 오류:", error);
    alert("삭제 중 오류가 발생했습니다.");
  } finally {
    isDeleting.value = null;
  }
};

const handleLogout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
    router.push("/admin/login");
  } catch (error) {
    console.error("로그아웃 오류:", error);
  }
};

const formatDate = (date: Date): string => {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<style scoped>
.admin-business-finder-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
}

.admin-content {
  flex: 1;
  padding: 120px 0 80px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
}

.admin-list-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-button {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-button:hover {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.logout-button {
  padding: 12px 24px;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: var(--muted-text);
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

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: var(--surface-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.project-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-organization {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  line-height: 1.4;
}

.project-meta {
  font-size: 14px;
  color: var(--muted-text);
  margin: 0;
}

.delete-button {
  padding: 8px 16px;
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-button:hover:not(:disabled) {
  background-color: #e74c3c;
  color: white;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 글 작성 폼 뷰 */
.admin-form-view {
  background-color: var(--surface-bg);
  border-radius: 12px;
  padding: 40px;
  border: 1px solid var(--border-color);
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--secondary-bg);
  color: var(--text-color);
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 119, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

.reset-button {
  padding: 12px 24px;
  background-color: var(--secondary-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: var(--hover-bg);
}

.submit-button {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.success-message {
  color: #27ae60;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.cancel-button {
  padding: 10px 20px;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .admin-container {
    padding: 0 4%;
  }

  .admin-form-view {
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
  }

  .project-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

