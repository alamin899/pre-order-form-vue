# pre-order

This template should help get you started developing with Vue 3 in Vite.

## Project Setup

```sh
npm install
npm run dev
npm run build
```

### google recaptch configration

```sh
RECAPTCHA_SITE_KEY this key add on your .env 
          OR
add on main.js 
app.use(VueReCaptcha, {
    siteKey:  "6Lem9OYoAAAAAFB9_JpLUomEi_Lhkvx15y1oIZ2qhjhk"
});
```

### configration

```sh
add API_BASE_URL=http://localhost:8000/pre-order/api/  to your .env
              OR
const axiosInstance = axios.create({
    baseURL:'http://localhost:8000/pre-order/api',
});
```


