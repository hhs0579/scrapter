import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../views/LandingView.vue";
import AppView from "../views/AppView.vue";
import UserGuideView from "../views/UserGuideView.vue";
import QuestionView from "../views/QuestionView.vue";
import QuestionFormView from "../views/QuestionFormView.vue";
import SubmitCompleteView from "../views/SubmitCompleteView.vue";
import ManuscriptView from "../views/ManuscriptView.vue";
import SignUpView from "../views/SignUpView.vue";
import TermsAgreementView from "../views/TermsAgreementView.vue";
import BasicInfoView from "../views/BasicInfoView.vue";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import InsightsView from "../views/InsightsView.vue";
import InsightDetailView from "../views/InsightDetailView.vue";
import BusinessFinderView from "../views/BusinessFinderView.vue";
import BusinessFinderDetailView from "../views/BusinessFinderDetailView.vue";
import AdminLoginView from "../views/AdminLoginView.vue";
import AdminView from "../views/AdminView.vue";
import AdminBusinessFinderView from "../views/AdminBusinessFinderView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: LandingView,
    },
    {
      path: "/app",
      name: "app",
      component: AppView,
    },
    {
      path: "/question",
      name: "question",
      component: QuestionView,
    },
    {
      path: "/question-form",
      name: "question-form",
      component: QuestionFormView,
    },
    {
      path: "/submit-complete",
      name: "submit-complete",
      component: SubmitCompleteView,
    },
    {
      path: "/manuscript",
      name: "manuscript",
      component: ManuscriptView,
    },
    {
      path: "/user-guide",
      name: "user-guide",
      component: UserGuideView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/signup",
      name: "signup",
      component: SignUpView,
    },
    {
      path: "/terms-agreement",
      name: "terms-agreement",
      component: TermsAgreementView,
    },
    {
      path: "/basic-info",
      name: "basic-info",
      component: BasicInfoView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/dashboard/manuscripts",
      name: "dashboard-manuscripts",
      component: DashboardView,
    },
    {
      path: "/dashboard/my-insights",
      name: "dashboard-my-insights",
      component: DashboardView,
    },
    {
      path: "/insights",
      name: "insights",
      component: InsightsView,
    },
    {
      path: "/insights/:id",
      name: "insight-detail",
      component: InsightDetailView,
    },
    {
      path: "/business-finder",
      name: "business-finder",
      component: BusinessFinderView,
    },
    {
      path: "/business-finder/:id",
      name: "business-finder-detail",
      component: BusinessFinderDetailView,
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: AdminLoginView,
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
    },
    {
      path: "/admin/business-finder",
      name: "admin-business-finder",
      component: AdminBusinessFinderView,
    },
  ],
});

export default router;
