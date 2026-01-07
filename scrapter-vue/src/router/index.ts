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
  ],
});

export default router;
