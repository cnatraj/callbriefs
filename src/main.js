import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useOrgStore } from './stores/org'
import './assets/tokens.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

const auth = useAuthStore()
const org = useOrgStore()

auth
  .init()
  .then(() => (auth.isAuthed ? org.init() : null))
  .then(() => app.mount('#app'))
