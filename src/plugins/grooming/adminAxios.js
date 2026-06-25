import axios from 'axios';
import useAdminStore from '@/stores/grooming/admin.js';

// 管理員專用的 axios，跟會員共用的 axios.js 是完全獨立的兩支，
// 差別只是「送出前自動帶的 token」改成管理員的，其他設定一樣。
const instance = axios.create({
    baseURL: 'http://localhost:8080'
});

instance.interceptors.request.use(
    function (config) {
        const adminStore = useAdminStore();
        if (adminStore.token) {
            config.headers.Authorization = `Bearer ${adminStore.token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        // 管理員 token 沒帶/失效時，導回管理員登入頁（不是會員的 403 頁）
        if (error.response && error.response.status === 403) {
            window.location.href = '/grooming/admin-login';
        }
        return Promise.reject(error);
    }
);

export default instance;
