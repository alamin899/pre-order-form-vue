import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css'; // Import the toastify CSS


const axiosInstance = axios.create({
    baseURL: import.meta.env.API_BASE_URL || 'http://localhost:8000/pre-order/api',
});

const app = createApp(App);

app.config.globalProperties.$axios = axiosInstance;

app.use(VueReCaptcha, {
    siteKey: import.meta.env.RECAPTCHA_SITE_KEY || "6Lem9OYoAAAAAFB9_JpLUomEi_Lhkvx15y1oIZ2q"
});
app.use(Vue3Toastify)

app.use(router).mount('#app');


export { axiosInstance };