<template>
  <div class="business-finder-detail-view">
    <CommonHeader />
    <main class="detail-content">
      <div class="detail-container">
        <button @click="goBack" class="back-button">
          <span class="material-icons">arrow_back</span>
          목록으로
        </button>

        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>

        <div v-else-if="!project" class="error-state">
          <p>지원사업을 찾을 수 없습니다.</p>
          <button @click="goBack" class="back-button">목록으로 돌아가기</button>
        </div>

        <article v-else class="project-article">
          <div class="article-header">
            <span class="article-organization">{{ project.organization }}</span>
            <h1 class="article-title">{{ project.title }}</h1>
            <div class="article-meta">
              <span class="article-date">{{ formatDate(project.date) }}</span>
            </div>
          </div>

          <div class="article-section">
            <h2 class="section-title">지원 조건</h2>
            <p class="section-content">{{ project.condition }}</p>
          </div>

          <div class="article-section">
            <h2 class="section-title">상세 내용</h2>
            <p class="section-content">{{ project.content }}</p>
          </div>

          <div v-if="project.link" class="article-actions">
            <button @click="openLink" class="action-button">
              지원사업 확인하기
            </button>
          </div>
        </article>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
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
const route = useRoute();
const project = ref<BusinessProject | null>(null);
const isLoading = ref(false);

onMounted(async () => {
  const projectId = route.params.id as string;
  if (projectId) {
    await loadProject(projectId);
  }
});

const loadProject = async (id: string) => {
  if (!db) {
    console.error("Firestore가 초기화되지 않았습니다.");
    return;
  }

  isLoading.value = true;
  try {
    const projectDocRef = doc(db, "businessFinder", id);
    const projectDoc = await getDoc(projectDocRef);

    if (projectDoc.exists()) {
      const data = projectDoc.data();
      project.value = {
        id: projectDoc.id,
        organization: data.organization || "",
        title: data.title || "",
        date: data.date?.toDate() || new Date(),
        condition: data.condition || "",
        content: data.content || "",
        link: data.link || "",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }
  } catch (error) {
    console.error("지원사업 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push("/business-finder");
};

const openLink = () => {
  if (project.value?.link) {
    window.open(project.value.link, "_blank");
  }
};

const formatDate = (date: Date): string => {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};
</script>

<style scoped>
.business-finder-detail-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
}

.detail-content {
  flex: 1;
  padding: 120px 0 80px;
}

.detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 32px;
}

.back-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.back-button .material-icons {
  font-size: 20px;
}

.loading-state,
.error-state {
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

.project-article {
  background-color: var(--surface-bg);
  border-radius: 12px;
  padding: 48px;
  border: 1px solid var(--border-color);
}

.article-header {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
}

.article-organization {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  margin-bottom: 16px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
  color: var(--muted-text);
}

.article-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0 0 12px 0;
}

.section-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-color);
  margin: 0;
  white-space: pre-wrap;
}

.article-actions {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.action-button {
  padding: 14px 28px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

@media (max-width: 768px) {
  .detail-container {
    padding: 0 16px;
  }

  .project-article {
    padding: 24px;
  }

  .article-title {
    font-size: 24px;
  }

  .section-title {
    font-size: 18px;
  }

  .section-content {
    font-size: 15px;
  }

  .article-actions {
    justify-content: stretch;
  }

  .action-button {
    width: 100%;
  }
}
</style>

