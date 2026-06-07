import { defineStore } from 'pinia';
import { ref } from 'vue';

const useUserStore = defineStore("user", function() {
        const token = ref("");
        function setToken(value) {
            token.value = value;
        }

        // 登入帳號
        const account = ref("");
        function setAccount(value) {
            account.value = value;
        }

        // 聯絡用電子信箱（個人資料頁會用到）
        const email = ref("");
        function setEmail(value) {
            email.value = value;
        }

        // 登出：清空所有使用者資料
        function logout() {
            token.value = "";
            account.value = "";
            email.value = "";
        }

        return {
            token,
            setToken,
            account,
            setAccount,
            email,
            setEmail,
            logout
        };
    }, {
        persist: {
            storage: sessionStorage
        }
    }
);

export default useUserStore;