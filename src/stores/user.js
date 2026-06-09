import { defineStore } from 'pinia';
import { ref } from 'vue';

const useUserStore = defineStore("user", function() {
        const token = ref("");
        function setToken(value) {
            token.value = value;
        }

        // ===== 會員資料（共用資料源） =====
        // 沒後端時先空的，之後登入撈回來用 setMemberInfo 塞進來
        const memberInfo = ref({
            name: "",
            account: "",
            email: "",
            phone: "",
            address: "",
            createDate: "",
            birthday: "",
            idNumber: "",
            gender: ""
        });

        // 設定 / 更新會員資料（可只傳部分欄位，會自動合併）
        function setMemberInfo(data) {
            Object.assign(memberInfo.value, data);/*只修改訂欄位不會影響整個memberInfo資料*/
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
        function setSelectPetId(id) {
            selectPetId.value = id;
        }

        // 登出：清空所有使用者資料
        function logout() {
            token.value = "";
            Object.assign(memberInfo.value, {
                name: "",
                account: "",
                email: "",
                phone: "",
                address: "",
                createDate: "",
                birthday: "",
                idNumber: "",
                gender: ""
            });
            pets.value = [];
            selectPetId.value = null;
        }

        return {
            token,
            setToken,
            memberInfo,
            setMemberInfo,
            pets,
            setPets,
            selectPetId,
            setSelectPetId,
            logout
        };
    }, {
        persist: {
            storage: sessionStorage
        }
    }
);

export default useUserStore;
