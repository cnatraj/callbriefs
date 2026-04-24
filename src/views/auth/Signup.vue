<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import SSOButton from "@/components/auth/SSOButton.vue";
import TextField from "@/components/auth/TextField.vue";
import { IconEye, IconCheck, IconArrowRight } from "@/components/icons";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();
const { loading, error } = storeToRefs(auth);

const name = ref("");
const email = ref("");
const password = ref("");
const acceptTerms = ref(true);
const showPassword = ref(false);

const handleSubmit = async () => {
  if (!acceptTerms.value) return;
  const { error: err } = await auth.signUpWithEmail({
    email: email.value,
    password: password.value,
    fullName: name.value,
  });
  if (err) return;
  router.push("/onboarding");
};

const handleGoogle = () => auth.signInWithGoogle();
</script>

<template>
  <div class="min-h-screen bg-bg relative" data-screen-label="Signup">
    <!-- Top bar -->
    <header class="flex items-center justify-between px-8 py-7">
      <div class="flex items-center gap-[10px]">
        <div
          class="w-[32px] h-[32px] rounded-[8px] bg-ink-900 text-bg grid place-items-center"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 8c3-4 13-4 16 0" />
            <path d="M7 13c2-2.5 8-2.5 10 0" />
            <path d="M10 18h4" />
          </svg>
        </div>
        <div
          class="text-[17px] font-semibold text-ink-900"
          style="letter-spacing: -0.015em"
        >
          CallBriefs
        </div>
        <span
          class="mono ml-[2px] text-[10px] text-ink-500 px-[6px] py-[2px] border border-ink-150 rounded-xs bg-surface"
        >
          BETA
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-ink-500">Already have an account?</span>
        <router-link
          to="/login"
          class="text-ink-900 font-semibold cursor-pointer"
        >
          Sign in
        </router-link>
      </div>
    </header>

    <!-- Card -->
    <main class="flex justify-center px-6 pt-6 pb-16">
      <div
        class="w-full max-w-[420px] bg-surface border border-ink-150 rounded-[16px] p-10"
        style="box-shadow: 0 1px 2px rgba(20, 20, 20, 0.03)"
      >
        <div class="text-center mb-6">
          <h2
            class="text-[24px] font-semibold text-ink-900"
            style="letter-spacing: -0.025em"
          >
            Create your account
          </h2>
          <p class="text-ink-500 mt-2">
            Signing up for CallBriefs only takes a minute.
          </p>
        </div>

        <!-- SSO options -->
        <div class="flex flex-col gap-[10px]">
          <SSOButton @click="handleGoogle">
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
            </template>
            Sign up with Google
          </SSOButton>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="h-px flex-1 bg-ink-150" />
          <span class="eyebrow">Or with email</span>
          <div class="h-px flex-1 bg-ink-150" />
        </div>

        <!-- Form -->
        <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-ink-900">
              Full name
            </label>
            <TextField
              v-model="name"
              type="text"
              placeholder="Ava Chen"
              autocomplete="name"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-ink-900">
              Work email
            </label>
            <TextField
              v-model="email"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-ink-900">
              Password
            </label>
            <TextField
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 8 characters"
              autocomplete="new-password"
            >
              <template #suffix>
                <button
                  type="button"
                  class="text-ink-500 hover:text-ink-900 cursor-pointer bg-transparent border-0 p-1"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <IconEye :size="16" />
                </button>
              </template>
            </TextField>
          </div>

          <!-- Terms -->
          <label class="flex items-start gap-[10px] cursor-pointer select-none">
            <span
              class="w-[18px] h-[18px] mt-[1px] grid place-items-center rounded-xs shrink-0 transition-colors"
              :class="
                acceptTerms
                  ? 'bg-ink-900 text-bg border border-ink-900'
                  : 'bg-surface border border-ink-200'
              "
            >
              <IconCheck v-if="acceptTerms" :size="12" :sw="3" />
            </span>
            <input v-model="acceptTerms" type="checkbox" class="sr-only" />
            <span class="text-ink-900 text-[13.5px] leading-[1.45]">
              I agree to the
              <a class="underline hover:text-ink-700">Terms of Service</a> and
              <a class="underline hover:text-ink-700">Privacy Policy</a>.
            </span>
          </label>

          <!-- Error -->
          <div
            v-if="error"
            class="text-[13px] text-danger rounded-[8px] px-3 py-[10px]"
            style="
              background: color-mix(in oklch, var(--danger) 10%, white 90%);
              border: 1px solid
                color-mix(in oklch, var(--danger) 30%, var(--ink-150) 70%);
            "
          >
            {{ error }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !acceptTerms"
            class="mt-1 inline-flex items-center justify-center gap-[10px] h-[52px] rounded-[12px] bg-accent hover:bg-accent-strong text-accent-ink border border-accent-strong font-semibold text-[15px] cursor-pointer shadow-cta transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ loading ? "Creating account…" : "Create account" }}
            <IconArrowRight v-if="!loading" :size="16" :sw="2" />
          </button>
        </form>

        <!-- Sign-in footer -->
        <div class="text-center mt-7 text-ink-500">
          Already have an account?
          <router-link
            to="/login"
            class="text-ink-900 font-semibold cursor-pointer ml-[2px]"
          >
            Sign in →
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>
