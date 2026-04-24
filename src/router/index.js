import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import Knowledge from "@/views/Knowledge.vue";
import Users from "@/views/Users.vue";
import Settings from "@/views/Settings.vue";
import Login from "@/views/auth/Login.vue";
import Signup from "@/views/auth/Signup.vue";
import AuthCallback from "@/views/auth/AuthCallback.vue";
import Onboarding from "@/views/onboarding/Onboarding.vue";
import Microsite from "@/views/Microsite.vue";
import { useAuthStore } from "@/stores/auth";
import { useOrgStore } from "@/stores/org";

export const pages = {
  briefs: { crumb: "Dashboard", search: "Search briefs, companies, reps…" },
  knowledge: { crumb: "Knowledge", search: "Search artifacts, tags, owners…" },
  users: { crumb: "Users", search: "Search users, teams…" },
  settings: { crumb: "Settings", search: "Search settings…" },
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/briefs" },
    { path: "/briefs", name: "briefs", component: Dashboard },
    { path: "/knowledge", name: "knowledge", component: Knowledge },
    { path: "/users", name: "users", component: Users },
    { path: "/settings", name: "settings", component: Settings },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { layout: "auth", public: true },
    },
    {
      path: "/signup",
      name: "signup",
      component: Signup,
      meta: { layout: "auth", public: true },
    },
    {
      path: "/auth/callback",
      name: "auth-callback",
      component: AuthCallback,
      meta: { layout: "auth", public: true },
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: Onboarding,
      meta: { layout: "onboarding" },
    },
    {
      path: "/m/:id?",
      name: "microsite",
      component: Microsite,
      meta: { layout: "microsite", public: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.init();

  const org = useOrgStore();
  if (auth.isAuthed) await org.init();

  const isPublic = to.meta.public === true;

  if (!auth.isAuthed && !isPublic) return "/login";

  if (auth.isAuthed && (to.name === "login" || to.name === "signup")) {
    return org.isOnboarded ? "/briefs" : "/onboarding";
  }

  if (
    auth.isAuthed &&
    !org.isOnboarded &&
    to.name !== "onboarding" &&
    !isPublic
  ) {
    return "/onboarding";
  }

  if (auth.isAuthed && org.isOnboarded && to.name === "onboarding") {
    return "/briefs";
  }
});

export default router;
