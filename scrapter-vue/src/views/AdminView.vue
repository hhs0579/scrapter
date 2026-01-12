<template>
  <div class="admin-view">
    <CommonHeader />
    <main class="admin-content">
      <div class="admin-container">
        <!-- 탭 메뉴 -->
        <div class="admin-tabs">
          <button
            @click="activeTab = 'insights'"
            :class="['tab-button', { active: activeTab === 'insights' }]"
          >
            인사이트 관리
          </button>
          <button
            @click="activeTab = 'business-finder'"
            :class="['tab-button', { active: activeTab === 'business-finder' }]"
          >
            비즈니스 파인더 관리
          </button>
          <button @click="handleLogout" class="logout-button">로그아웃</button>
        </div>

        <!-- 인사이트 관리 -->
        <div v-if="activeTab === 'insights'">
          <!-- 글 목록 뷰 -->
          <div v-if="!showCreateForm" class="admin-list-view">
            <div class="admin-header">
              <h1 class="page-title">인사이트 관리</h1>
              <div class="header-actions">
                <button @click="showCreateForm = true" class="create-button">
                  글작성
                </button>
              </div>
            </div>

            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>로딩 중...</p>
            </div>
            <div v-else-if="insights.length === 0" class="empty-state">
              <p>작성된 글이 없습니다.</p>
              <button @click="showCreateForm = true" class="create-button">
                첫 글 작성하기
              </button>
            </div>
            <div v-else class="insights-list">
              <div
                v-for="insight in insights"
                :key="insight.id"
                class="insight-item"
                @click="editInsight(insight)"
              >
                <div
                  v-if="insight.imageUrls && insight.imageUrls.length > 0"
                  class="insight-thumbnail"
                >
                  <img :src="insight.imageUrls[0]" :alt="insight.title" />
                </div>
                <div v-else-if="insight.imageUrl" class="insight-thumbnail">
                  <img :src="insight.imageUrl" :alt="insight.title" />
                </div>
                <div class="insight-info">
                  <span class="insight-category">{{ insight.category }}</span>
                  <h3 class="insight-title">{{ insight.title }}</h3>
                  <p class="insight-snippet">{{ insight.snippet }}</p>
                  <p class="insight-meta">
                    {{ formatDate(insight.createdAt) }}
                    <span v-if="insight.source"> · {{ insight.source }}</span>
                  </p>
                </div>
                <button
                  @click.stop="deleteInsight(insight.id)"
                  class="delete-button"
                  :disabled="isDeleting === insight.id"
                >
                  {{ isDeleting === insight.id ? "삭제 중..." : "삭제" }}
                </button>
              </div>
            </div>
          </div>

          <!-- 글 작성/수정 폼 -->
          <div v-else class="admin-form-view">
            <div class="admin-header">
              <h1 class="page-title">
                {{ editingInsight ? "글 수정" : "글 작성" }}
              </h1>
              <button @click="cancelEdit" class="cancel-button">취소</button>
            </div>

            <form @submit.prevent="handleSubmit" class="admin-form">
              <div class="form-group">
                <label for="category">카테고리 *</label>
                <select
                  id="category"
                  v-model="formData.category"
                  required
                  class="form-select"
                >
                  <option value="">선택하세요</option>
                  <option value="창업 인사이트">창업 인사이트</option>
                  <option value="투자유치 전략">투자유치 전략</option>
                  <option value="트렌드 뉴스">트렌드 뉴스</option>
                </select>
              </div>

              <div class="form-group">
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="title-input"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div class="form-group">
                <div ref="editorContainer" class="editor-container"></div>
              </div>

              <div class="form-group">
                <label>요약/본문 일부 *</label>
                <textarea
                  v-model="formData.snippet"
                  required
                  class="form-textarea"
                  rows="3"
                  placeholder="요약 또는 본문의 일부를 입력하세요"
                ></textarea>
              </div>

              <div class="form-group">
                <label>출처</label>
                <input
                  v-model="formData.source"
                  type="text"
                  class="form-input"
                  placeholder="예: 주식회사 넥스트유니콘, 이볼브"
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

        <!-- 비즈니스 파인더 관리 -->
        <div v-if="activeTab === 'business-finder'">
          <!-- 글 목록 뷰 -->
          <div v-if="!showProjectForm" class="admin-list-view">
            <div class="admin-header">
              <h1 class="page-title">비즈니스 파인더 관리</h1>
              <div class="header-actions">
                <button @click="showProjectForm = true" class="create-button">
                  새 지원사업 작성
                </button>
              </div>
            </div>

            <div v-if="isLoadingProjects" class="loading-state">
              <div class="loading-spinner"></div>
              <p>로딩 중...</p>
            </div>
            <div v-else-if="projects.length === 0" class="empty-state">
              <p>작성된 지원사업이 없습니다.</p>
              <button @click="showProjectForm = true" class="create-button">
                첫 지원사업 작성하기
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
                  <span class="project-organization">{{
                    project.organization
                  }}</span>
                  <h3 class="project-title">{{ project.title }}</h3>
                  <p class="project-condition">{{ project.condition }}</p>
                  <p class="project-meta">
                    {{ formatProjectDate(project.date) }}
                  </p>
                </div>
                <button
                  @click.stop="deleteProject(project.id)"
                  class="delete-button"
                  :disabled="isDeletingProject === project.id"
                >
                  {{ isDeletingProject === project.id ? "삭제 중..." : "삭제" }}
                </button>
              </div>
            </div>
          </div>

          <!-- 글 작성/수정 폼 -->
          <div v-else class="admin-form-view">
            <div class="admin-header">
              <h1 class="page-title">
                {{ editingProject ? "지원사업 수정" : "새 지원사업 작성" }}
              </h1>
              <button @click="cancelProjectEdit" class="cancel-button">
                취소
              </button>
            </div>

            <form @submit.prevent="handleProjectSubmit" class="admin-form">
              <div class="form-group">
                <label for="organization">주최 기관 *</label>
                <input
                  id="organization"
                  v-model="projectFormData.organization"
                  type="text"
                  required
                  class="form-input"
                  placeholder="예: 중소벤처기업부, 인천테크노파크"
                />
              </div>

              <div class="form-row">
                <div class="form-group" style="flex: 1">
                  <label for="project-title">제목 *</label>
                  <input
                    id="project-title"
                    v-model="projectFormData.title"
                    type="text"
                    required
                    class="form-input"
                    placeholder="지원사업 제목을 입력하세요"
                  />
                </div>
                <div class="form-group" style="width: 200px">
                  <label for="project-date">날짜 *</label>
                  <input
                    id="project-date"
                    v-model="projectFormData.date"
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
                  v-model="projectFormData.condition"
                  type="text"
                  required
                  class="form-input"
                  placeholder="예: 3년이내 창업자"
                />
              </div>

              <div class="form-group">
                <label for="project-content">내용 *</label>
                <textarea
                  id="project-content"
                  v-model="projectFormData.content"
                  required
                  class="form-textarea"
                  rows="5"
                  placeholder="지원사업에 대한 상세 내용을 입력하세요"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="project-link">지원사업 링크 (선택)</label>
                <input
                  id="project-link"
                  v-model="projectFormData.link"
                  type="url"
                  class="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  @click="handleProjectReset"
                  class="reset-button"
                >
                  초기화
                </button>
                <button
                  type="submit"
                  class="submit-button"
                  :disabled="isSubmittingProject"
                >
                  {{ isSubmittingProject ? "저장 중..." : "저장하기" }}
                </button>
              </div>

              <p v-if="projectSubmitError" class="error-message">
                {{ projectSubmitError }}
              </p>
              <p v-if="projectSubmitSuccess" class="success-message">
                {{ projectSubmitSuccess }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
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
import Quill from "quill";
import "quill/dist/quill.snow.css";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

interface Insight {
  id: string;
  title: string;
  category: string;
  snippet: string;
  source?: string;
  imageUrl?: string;
  imageUrls?: string[];
  content?: string;
  createdAt: Date;
}

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
const editorContainer = ref<HTMLElement | null>(null);
let quillEditor: Quill | null = null;

const activeTab = ref<"insights" | "business-finder">("insights");

// 인사이트 관리 관련
const showCreateForm = ref(false);
const editingInsight = ref<Insight | null>(null);
const formData = ref({
  title: "",
  category: "",
  snippet: "",
  source: "",
  content: "",
});
const insights = ref<Insight[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(false);
const isDeleting = ref<string | null>(null);
const submitError = ref("");
const submitSuccess = ref("");

// 비즈니스 파인더 관리 관련
const showProjectForm = ref(false);
const editingProject = ref<BusinessProject | null>(null);
const projectFormData = ref({
  organization: "",
  title: "",
  date: "",
  condition: "",
  content: "",
  link: "",
});
const projects = ref<BusinessProject[]>([]);
const isSubmittingProject = ref(false);
const isLoadingProjects = ref(false);
const isDeletingProject = ref<string | null>(null);
const projectSubmitError = ref("");
const projectSubmitSuccess = ref("");

// 어드민 로그인 확인
const checkAdminAuth = async () => {
  if (!auth || !db) {
    router.push("/admin/login");
    return false;
  }

  if (!auth.currentUser) {
    router.push("/admin/login");
    return false;
  }

  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      router.push("/admin/login");
      return false;
    }

    const userData = userDoc.data();
    const nickname = userData?.nickname;

    if (nickname !== "admin") {
      router.push("/admin/login");
      return false;
    }

    return true;
  } catch (error) {
    console.error("어드민 인증 확인 오류:", error);
    router.push("/admin/login");
    return false;
  }
};

onMounted(async () => {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return;
  await loadInsights();
  await loadProjects();
});

onUnmounted(() => {
  if (quillEditor) {
    quillEditor = null;
  }
});

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("이미지 변환 실패"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const initEditor = async () => {
  if (!editorContainer.value) return;

  // 기존 에디터가 있으면 제거
  if (quillEditor) {
    if (editorContainer.value) {
      editorContainer.value.innerHTML = "";
    }
    quillEditor = null;
  }

  await nextTick();

  if (editorContainer.value) {
    quillEditor = new Quill(editorContainer.value, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    // 이미지 핸들러 커스터마이징 (base64로 변환)
    const toolbar = quillEditor.getModule("toolbar") as any;
    toolbar.addHandler("image", async () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file || !quillEditor) return;

        // 파일 크기 체크 (500KB 제한 - Firestore 문서 크기 제한 고려)
        const maxSize = 500 * 1024; // 500KB
        if (file.size > maxSize) {
          alert(
            `이미지 크기가 너무 큽니다. (최대 500KB)\n현재 크기: ${(
              file.size / 1024
            ).toFixed(2)}KB\n더 작은 이미지를 사용해주세요.`
          );
          return;
        }

        const currentRange = quillEditor.getSelection(true);
        if (!currentRange) {
          // 범위가 없으면 에디터 끝에 삽입
          const length = quillEditor.getLength();
          quillEditor.setSelection(length - 1, 0);
        }

        const range = quillEditor.getSelection(true);
        if (!range) return;

        try {
          // base64로 변환
          const base64Image = await fileToBase64(file);

          // 에디터에 이미지 삽입
          quillEditor.insertEmbed(range.index, "image", base64Image, "user");
          quillEditor.setSelection(range.index + 1, 0);
        } catch (error: any) {
          console.error("이미지 변환 오류:", error);
          alert("이미지 변환 중 오류가 발생했습니다.");
        }
      };
    });

    // 기존 내용이 있으면 설정
    if (formData.value.content && quillEditor) {
      quillEditor.root.innerHTML = formData.value.content;
    }
  }
};

const loadInsights = async () => {
  if (!db) {
    console.error("Firestore가 초기화되지 않았습니다.");
    return;
  }

  isLoading.value = true;
  try {
    const insightsRef = collection(db, "insights");
    const q = query(insightsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    insights.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        category: data.category || "",
        snippet: data.snippet || "",
        source: data.source || "",
        imageUrl: data.imageUrl || "",
        imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
        content: data.content || "",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("인사이트 로드 오류:", error);
    submitError.value = "인사이트를 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};

const editInsight = async (insight: Insight) => {
  editingInsight.value = insight;
  formData.value = {
    title: insight.title,
    category: insight.category,
    snippet: insight.snippet,
    source: insight.source || "",
    content: insight.content || "",
  };
  showCreateForm.value = true;
  await nextTick();
  // watch에서 initEditor가 호출되므로 여기서는 호출하지 않음
};

const cancelEdit = () => {
  // 변경사항이 있는지 확인
  const hasChanges =
    formData.value.title ||
    formData.value.category ||
    formData.value.snippet ||
    formData.value.source ||
    (quillEditor && quillEditor.root.innerHTML !== "<p><br></p>");

  if (hasChanges) {
    if (confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
      showCreateForm.value = false;
      editingInsight.value = null;
      handleReset();
      if (quillEditor) {
        quillEditor = null;
      }
    }
  } else {
    showCreateForm.value = false;
    editingInsight.value = null;
    handleReset();
    if (quillEditor) {
      quillEditor = null;
    }
  }
};

const extractImagesFromContent = (html: string): string[] => {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) {
      images.push(match[1]);
    }
  }
  return images;
};

const handleSubmit = async () => {
  if (!db) {
    submitError.value = "Firestore가 초기화되지 않았습니다.";
    return;
  }

  if (!quillEditor) {
    submitError.value = "에디터가 초기화되지 않았습니다.";
    return;
  }

  isSubmitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

  try {
    const content = quillEditor.root.innerHTML;

    // 전체 콘텐츠 크기 체크 (Firestore 문서 크기 제한 1MB 고려)
    const contentSize = new Blob([content]).size;
    const maxContentSize = 900 * 1024; // 900KB (1MB 제한 여유있게)

    if (contentSize > maxContentSize) {
      const contentSizeMB = (contentSize / 1024 / 1024).toFixed(2);
      alert(
        `콘텐츠 크기가 너무 큽니다. (최대 약 900KB)\n현재 크기: ${contentSizeMB}MB\n이미지를 줄이거나 텍스트를 줄여주세요.`
      );
      isSubmitting.value = false;
      return;
    }

    // base64 이미지 크기 체크
    const imageUrls = extractImagesFromContent(content);
    for (const imageUrl of imageUrls) {
      if (imageUrl.startsWith("data:")) {
        // base64 이미지 크기 체크
        const base64Size = imageUrl.length * 0.75; // base64는 원본의 약 1.33배이므로 약 0.75를 곱하면 원본 크기
        const maxImageSize = 300 * 1024; // 300KB
        if (base64Size > maxImageSize) {
          alert(
            `이미지 크기가 너무 큽니다. (권장: 300KB 이하)\n현재 크기: 약 ${(
              base64Size / 1024
            ).toFixed(2)}KB\n이미지를 압축하거나 크기를 줄여주세요.`
          );
          isSubmitting.value = false;
          return;
        }
      }
    }

    const thumbnailUrl = imageUrls.length > 0 ? imageUrls[0] : null;

    const insightData: any = {
      title: formData.value.title,
      category: formData.value.category,
      snippet: formData.value.snippet,
      source: formData.value.source || null,
      content: content,
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
      imageUrl: thumbnailUrl,
      updatedAt: serverTimestamp(),
    };

    if (editingInsight.value) {
      // 수정 시에는 createdAt을 유지하고 updatedAt만 업데이트
      await updateDoc(
        doc(db, "insights", editingInsight.value.id),
        insightData
      );
      submitSuccess.value = "글이 성공적으로 수정되었습니다!";
    } else {
      // 새 글 작성 시에는 createdAt 추가
      insightData.createdAt = serverTimestamp();
      await addDoc(collection(db, "insights"), insightData);
      submitSuccess.value = "글이 성공적으로 저장되었습니다!";
    }

    handleReset();
    await loadInsights();
    setTimeout(() => {
      showCreateForm.value = false;
      editingInsight.value = null;
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
    title: "",
    category: "",
    snippet: "",
    source: "",
    content: "",
  };
  if (quillEditor) {
    quillEditor.root.innerHTML = "";
  }
  submitError.value = "";
  submitSuccess.value = "";
};

const deleteInsight = async (id: string) => {
  if (!db) return;
  if (!confirm("정말 삭제하시겠습니까?")) return;

  isDeleting.value = id;
  try {
    await deleteDoc(doc(db, "insights", id));
    await loadInsights();
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
    router.push("/");
  } catch (error) {
    console.error("로그아웃 오류:", error);
    router.push("/");
  }
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// 비즈니스 파인더 관리 함수들
const loadProjects = async () => {
  if (!db) {
    console.error("Firestore가 초기화되지 않았습니다.");
    return;
  }

  isLoadingProjects.value = true;
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
    projectSubmitError.value = "지원사업을 불러오는 중 오류가 발생했습니다.";
  } finally {
    isLoadingProjects.value = false;
  }
};

const editProject = async (project: BusinessProject) => {
  editingProject.value = project;
  const projectLink = project.link || "";
  const dateObj =
    project.date instanceof Date ? project.date : new Date(project.date);
  const projectDate: string = dateObj.toISOString().substring(0, 10);
  projectFormData.value = {
    organization: project.organization,
    title: project.title,
    date: projectDate,
    condition: project.condition,
    content: project.content,
    link: projectLink,
  };
  showProjectForm.value = true;
};

const cancelProjectEdit = () => {
  const hasChanges =
    projectFormData.value.organization ||
    projectFormData.value.title ||
    projectFormData.value.date ||
    projectFormData.value.condition ||
    projectFormData.value.content ||
    projectFormData.value.link;

  if (hasChanges) {
    if (confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
      showProjectForm.value = false;
      editingProject.value = null;
      handleProjectReset();
    }
  } else {
    showProjectForm.value = false;
    editingProject.value = null;
    handleProjectReset();
  }
};

const handleProjectSubmit = async () => {
  if (!db) {
    projectSubmitError.value = "Firestore가 초기화되지 않았습니다.";
    return;
  }

  isSubmittingProject.value = true;
  projectSubmitError.value = "";
  projectSubmitSuccess.value = "";

  try {
    const projectData: any = {
      organization: projectFormData.value.organization,
      title: projectFormData.value.title,
      date: new Date(projectFormData.value.date),
      condition: projectFormData.value.condition,
      content: projectFormData.value.content,
      link: projectFormData.value.link || null,
      updatedAt: serverTimestamp(),
    };

    if (editingProject.value) {
      await updateDoc(
        doc(db, "businessFinder", editingProject.value.id),
        projectData
      );
      projectSubmitSuccess.value = "지원사업이 성공적으로 수정되었습니다!";
    } else {
      projectData.createdAt = serverTimestamp();
      await addDoc(collection(db, "businessFinder"), projectData);
      projectSubmitSuccess.value = "지원사업이 성공적으로 저장되었습니다!";
    }

    handleProjectReset();
    await loadProjects();
    setTimeout(() => {
      showProjectForm.value = false;
      editingProject.value = null;
    }, 1000);
  } catch (error: any) {
    console.error("저장 오류:", error);
    const errorMessage = error?.message || error?.code || "알 수 없는 오류";
    projectSubmitError.value = `저장 중 오류가 발생했습니다: ${errorMessage}`;
  } finally {
    isSubmittingProject.value = false;
  }
};

const handleProjectReset = () => {
  projectFormData.value = {
    organization: "",
    title: "",
    date: "",
    condition: "",
    content: "",
    link: "",
  };
  projectSubmitError.value = "";
  projectSubmitSuccess.value = "";
};

const deleteProject = async (id: string) => {
  if (!db) return;
  if (!confirm("정말 삭제하시겠습니까?")) return;

  isDeletingProject.value = id;
  try {
    await deleteDoc(doc(db, "businessFinder", id));
    await loadProjects();
  } catch (error) {
    console.error("삭제 오류:", error);
    alert("삭제 중 오류가 발생했습니다.");
  } finally {
    isDeletingProject.value = null;
  }
};

const formatProjectDate = (date: Date): string => {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// watch showCreateForm to init editor
watch(showCreateForm, async (newVal) => {
  if (newVal) {
    await nextTick();
    await initEditor();
  }
});
</script>

<style scoped>
.admin-view {
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
  padding: 0 20px;
}

.admin-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0;
  align-items: center;
}

.tab-button {
  padding: 12px 24px;
  background-color: transparent;
  color: var(--text-color);
  border: none;
  border-bottom: 3px solid transparent;
  border-radius: 0;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.admin-tabs .logout-button {
  margin-left: auto;
  padding: 12px 24px;
  margin-bottom: 1px;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-tabs .logout-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
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

.logout-button,
.cancel-button {
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

.logout-button:hover,
.cancel-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 글 목록 뷰 */
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

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: var(--surface-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.insight-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.insight-thumbnail {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--secondary-bg);
}

.insight-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.insight-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-category {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
}

.insight-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  line-height: 1.4;
}

.insight-snippet {
  font-size: 14px;
  color: var(--text-color);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.insight-meta {
  font-size: 12px;
  color: var(--muted-text);
  margin: 0;
  margin-top: auto;
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
  align-self: flex-start;
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

.form-select {
  padding: 12px 40px 12px 16px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--secondary-bg);
  color: var(--text-color);
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 20px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 119, 0, 0.1);
}

.dark .form-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23bdbdbd' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

.title-input {
  padding: 16px;
  font-size: 24px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid var(--border-color);
  background-color: transparent;
  color: var(--text-strong);
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}

.title-input:focus {
  border-bottom-color: var(--primary-color);
}

.title-input::placeholder {
  color: var(--muted-text);
  font-weight: 400;
}

.editor-container {
  min-height: 500px;
  background-color: var(--surface-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.editor-container :deep(.ql-container) {
  font-size: 16px;
  min-height: 400px;
  background-color: var(--surface-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}

.editor-container :deep(.ql-editor) {
  min-height: 400px;
  color: var(--text-color);
}

.editor-container :deep(.ql-editor.ql-blank::before) {
  color: var(--muted-text);
  font-style: normal;
}

.editor-container :deep(.ql-toolbar) {
  background-color: var(--secondary-bg);
  border-color: var(--border-color);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.editor-container :deep(.ql-toolbar .ql-stroke) {
  stroke: var(--text-color);
}

.editor-container :deep(.ql-toolbar .ql-fill) {
  fill: var(--text-color);
}

.editor-container :deep(.ql-toolbar .ql-picker-label) {
  color: var(--text-color);
}

.editor-container :deep(.ql-toolbar .ql-picker-options) {
  background-color: var(--surface-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

.editor-container :deep(.ql-toolbar button:hover),
.editor-container :deep(.ql-toolbar button:focus),
.editor-container :deep(.ql-toolbar button.ql-active) {
  background-color: var(--hover-bg);
}

.editor-container :deep(.ql-toolbar .ql-picker-item:hover) {
  background-color: var(--hover-bg);
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
  min-height: 80px;
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

@media (max-width: 768px) {
  .insight-item {
    flex-direction: column;
  }

  .insight-thumbnail {
    width: 100%;
    height: 200px;
  }

  .admin-form-view {
    padding: 20px;
  }

  .editor-container {
    min-height: 300px;
  }
}

/* 비즈니스 파인더 관리 스타일 */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  line-height: 1.4;
}

.project-condition {
  font-size: 14px;
  color: var(--text-color);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  font-size: 12px;
  color: var(--muted-text);
  margin: 0;
  margin-top: auto;
}
</style>
