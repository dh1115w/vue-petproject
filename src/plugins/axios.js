import axios from 'axios';
import useUserStore from '@/stores/user.js';

// 建立一個共用的 axios，之後所有 API 都用這個
// baseURL：後端網址，之後每次呼叫只要寫後面的路徑（例如 '/api/login'）即可
const instance = axios.create({
    baseURL: 'http://localhost:8080'
});

// ===== 送出前：自動幫每支 API 帶上 token =====
// 這個叫「request 攔截器」，每次 request 送出「之前」都會先經過這裡。
// 角色就像後端的「過濾器」：集中一次處理，組員打 API 就不用自己帶 token。
instance.interceptors.request.use(
    function (config) {
        // 在這裡才呼叫 useUserStore()，確保 Pinia 已經啟動（有實際發 request 時一定已經啟動）
        const userStore = useUserStore();
        // 如果 store 裡有 token，就放進 Authorization 標頭，格式固定是「Bearer 空格 token」
        if (userStore.token) {
            config.headers.Authorization = `Bearer ${userStore.token}`;
        }
        // config 一定要回傳，request 才會繼續送出去
        return config;
    },
    function (error) {
        // request 還沒送出就出錯，直接往下丟
        return Promise.reject(error);
    }
);

// ===== 收到後：統一處理後端的回應 =====
instance.interceptors.response.use(
    function (response) {
        // 正常回應就直接回傳
        return response;
    },
    function (error) {
        // 如果後端回 403（沒權限），就導向 403 頁
        if (error.response && error.response.status === 403) {
            window.location.href = '/403';
        }
        return Promise.reject(error);
    }
);

export default instance;
