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

        // ===== 寵物清單（共用資料源） =====
        // 沒後端時先空的，之後登入撈回來用 setPets 塞進來
        const pets = ref([]);

        // 一次設定整份清單（接後端撈回來時用）
        function setPets(list) {
            pets.value = list;
        }

        // 目前選定的「預設寵物」id
        // 各功能可拿這個 id 去後端撈那隻寵物的資料
        const selectPetId = ref(null);
        function setSelectPet(id) {
            selectPetId.value = id;
        }

        // 登出：清空所有使用者資料
        function logout() {
            token.value = "";
            account.value = "";
            email.value = "";
            pets.value = [];
            selectPetId.value = null;
        }

        return {
            token,
            setToken,
            account,
            setAccount,
            email,
            setEmail,
            pets,
            setPets,
            selectPetId,
            setSelectPet,
            logout
        };
    }, {
        persist: {
            storage: sessionStorage
        }
    }
);

export default useUserStore;