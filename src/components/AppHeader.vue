<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { IconSearch, IconBell, IconChevronDown } from "./icons";
import { useAuthStore } from "@/stores/auth";

defineProps({
  crumb: { type: String, default: "Dashboard" },
  subCrumb: { type: String, default: null },
  searchPlaceholder: {
    type: String,
    default: "Search briefs, companies, reps…",
  },
});

const router = useRouter();
const auth = useAuthStore();

const displayName = computed(
  () =>
    auth.user?.user_metadata?.full_name ||
    auth.user?.user_metadata?.name ||
    auth.user?.email ||
    "",
);
const displayEmail = computed(() => auth.user?.email ?? "");
const initials = computed(() => {
  const name =
    auth.user?.user_metadata?.full_name || auth.user?.user_metadata?.name;
  if (name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (auth.user?.email?.[0] ?? "?").toUpperCase();
});

const menuRef = ref(null);
const menuOpen = ref(false);

const handleSignOut = async () => {
  menuOpen.value = false;
  await auth.signOut();
  router.push("/login");
};

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    menuOpen.value = false;
  }
};
const handleEsc = (e) => {
  if (e.key === "Escape") menuOpen.value = false;
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEsc);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEsc);
});
</script>

<template>
  <header
    class="h-14 px-[28px] border-b border-ink-150 bg-bg flex items-center gap-3"
  >
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-2 text-[13px] text-ink-500 min-w-0">
      <router-link
        v-if="subCrumb"
        to="/briefs"
        class="hover:text-ink-900 transition-colors"
      >
        {{ crumb }}
      </router-link>
      <span v-else class="text-ink-900 font-medium">{{ crumb }}</span>
      <template v-if="subCrumb">
        <span class="text-ink-300">/</span>
        <span class="text-ink-900 font-medium truncate max-w-[280px]">
          {{ subCrumb }}
        </span>
      </template>
    </div>

    <!-- Search -->
    <div
      class="ml-auto flex items-center gap-2 w-[320px] h-8 px-[10px] rounded-[8px] border border-ink-150 bg-surface text-ink-500 text-[13px] cursor-pointer"
    >
      <IconSearch :size="14" />
      <span class="flex-1">{{ searchPlaceholder }}</span>
      <span
        class="mono text-[10.5px] text-ink-400 border border-ink-150 px-[5px] py-[1px] rounded-xs"
        >⌘K</span
      >
    </div>

    <!-- Notifications -->
    <button
      class="relative w-8 h-8 grid place-items-center rounded-[8px] border border-ink-150 bg-surface text-ink-700 cursor-pointer"
      title="Notifications"
    >
      <IconBell :size="15" />
      <span
        class="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full bg-danger"
      />
    </button>

    <!-- Avatar + menu -->
    <div ref="menuRef" class="relative">
      <button
        class="flex items-center gap-2 py-1 pl-1 pr-2 rounded-[8px] border border-ink-150 bg-surface cursor-pointer"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        @click="menuOpen = !menuOpen"
      >
        <div
          class="w-6 h-6 rounded-full bg-ink-900 text-bg grid place-items-center text-[10.5px] font-semibold"
        >
          {{ initials }}
        </div>
        <div class="text-[12.5px] leading-[1.15] text-left min-w-0">
          <div class="font-medium truncate max-w-[160px]">
            {{ displayName }}
          </div>
          <div class="text-ink-500 text-[11px] truncate max-w-[160px]">
            {{ displayEmail }}
          </div>
        </div>
        <IconChevronDown :size="13" class="text-ink-500 ml-[2px]" />
      </button>

      <div
        v-if="menuOpen"
        class="absolute top-full right-0 mt-2 w-[220px] bg-surface border border-ink-150 rounded-[10px] py-1 z-20 shadow-panel"
        role="menu"
      >
        <div class="px-3 py-2 border-b border-ink-100">
          <div class="text-[12.5px] font-medium text-ink-900 truncate">
            {{ displayName }}
          </div>
          <div class="text-[11.5px] text-ink-500 truncate">
            {{ displayEmail }}
          </div>
        </div>
        <button
          role="menuitem"
          class="w-full text-left px-3 py-[9px] text-[13px] text-ink-900 hover:bg-ink-100 cursor-pointer bg-transparent border-0"
          @click="handleSignOut"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
