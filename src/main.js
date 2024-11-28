import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/pre-order/api',
});

const app = createApp(App);

app.config.globalProperties.$axios = axiosInstance;

app.use(router).mount('#app');

export { axiosInstance };