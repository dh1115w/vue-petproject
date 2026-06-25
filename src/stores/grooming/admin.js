import { defineStore } from 'pinia';
import { ref } from 'vue';

// 管理員專用的 store，跟會員的 user.js 完全分開存，互不影響
const useAdminStore = defineStore("admin", function() {
        const token = ref("");
        function setToken(value) {
            token.value = value;
        }

        // 管理員資料（登入後從後端撈回來塞進來）
        const adminInfo = ref({
            id: null,
            name: "",
            account: "",
            email: "",
            phone: "",
            roleId: null
        });

        function setAdminInfo(data) {
            Object.assign(adminInfo.value, data);
        }

        // 登出：清空管理員 token 跟資料
        function logout() {
            token.value = "";
            Object.assign(adminInfo.value, {
                id: null,
                name: "",
                account: "",
                email: "",
                phone: "",
                roleId: null
            });
        }

        return {
            token,
            setToken,
            adminInfo,
            setAdminInfo,
            logout
        };
    }, {
        persist: {
            storage: sessionStorage
        }
    }
);

export default useAdminStore;
