<template>
  <div class="business-finder-view">
    <CommonHeader />
    <div class="business-finder-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          완성된 원고를 잘 활용할 수 있는<br />지원사업을 찾아봅니다
        </h1>
        <p class="hero-subtitle">
          사업 단계, 업종, 지역 정보를 기준으로 지금 신청 가능한 지원사업과
          과제를 정리해 제공합니다.
        </p>
      </div>
    </div>
    <main class="business-finder-content">
      <div class="business-finder-container">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>

        <div v-else-if="businessProjects.length === 0" class="empty-state">
          <p>등록된 지원사업이 없습니다.</p>
        </div>

        <div v-else class="projects-list">
          <div
            v-for="project in businessProjects"
            :key="project.id"
            class="project-item"
            @click="viewProject(project)"
          >
            <div class="project-main">
              <div class="project-header">
                <span class="project-organization">{{
                  project.organization
                }}</span>
                <div class="project-title-row">
                  <h3 class="project-title">{{ project.title }}</h3>
                  <span class="project-date">{{
                    formatDate(project.date)
                  }}</span>
                </div>
                <p class="project-condition">{{ project.condition }}</p>
                <p class="project-content">{{ project.content }}</p>
              </div>
              <div class="project-actions">
                <button @click.stop="viewProject(project)" class="view-button">
                  지원사업 확인하기
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db } from "../config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
const businessProjects = ref<BusinessProject[]>([]);
const isLoading = ref(false);

onMounted(() => {
  loadProjects();
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

    businessProjects.value = querySnapshot.docs.map((doc) => {
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
  } finally {
    isLoading.value = false;
  }
};

const viewProject = (project: BusinessProject) => {
  router.push(`/business-finder/${project.id}`);
};

const formatDate = (date: Date): string => {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};
</script>

<style scoped>
.business-finder-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
}

.business-finder-hero {
  background: linear-gradient(180deg, #fffcf9 0%, #fef5f0 100%);
  padding: 80px 0;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
  text-align: center;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.hero-subtitle {
  font-size: 14px;
  color: #5d5d5d;
  margin: 0;
  line-height: 1.6;
}

.business-finder-content {
  flex: 1;
  padding: 80px 0;
}

.business-finder-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
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
  gap: 0;
}

.project-item {
  border-bottom: 1px solid var(--border-color);
  padding: 32px 0;
  transition: border-color 0.2s;
  cursor: pointer;
}

.project-item:hover {
  border-color: var(--primary-color);
}

.project-item:last-child {
  border-bottom: none;
}

.project-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.project-header {
  flex: 1;
  min-width: 0;
}

.project-organization {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 12px;
}

.project-title-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  line-height: 1.4;
}

.project-date {
  font-size: 14px;
  color: var(--muted-text);
  white-space: nowrap;
}

.project-condition {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.project-content {
  font-size: 14px;
  color: var(--text-color);
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-actions {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
}

.view-button {
  padding: 10px 20px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.view-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .business-finder-hero {
    padding: 60px 0;
  }

  .hero-content {
    padding: 0 4%;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 13px;
  }

  .business-finder-container {
    padding: 0 4%;
  }

  .project-main {
    flex-direction: column;
    gap: 16px;
  }

  .project-actions {
    align-self: flex-end;
  }

  .project-title-row {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
