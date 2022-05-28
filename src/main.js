import { createApp, reactive, ref } from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
const app = createApp(App)
app.provide('searchMode', ref(false))
app.provide('pathnow', reactive([]))
app.provide('axios', axios)
axios.defaults.baseURL = 'http://47.96.253.99/Netdisk'
app.use(router)
window.router = router
axios.defaults.headers.common['Authorization'] = localStorage.getItem("Itoken");
app.mount("#app")