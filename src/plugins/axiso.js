import axios from 'axios';

// 建立一個共用的 axios，之後所有 API 都用這個
// baseURL：後端網址，之後每次呼叫只要寫後面的路徑（例如 '/api/login'）即可
const instance = axios.create({
    baseURL: 'http://localhost:8080'
});

// 統一處理後端的回應
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