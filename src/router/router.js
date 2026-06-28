import boardingRoutes from '@/router/boarding/BoardingRouter.js'
import groomingRoutes from '@/router/grooming/GroomingRouter.js'
import medicalRoutes from '@/router/medical/MedicalRouter.js'
import memberRoutes from '@/router/member/MemberRouter.js'
import NotFound from '@/views/secure/NotFound.vue'
import Forbidden from '@/views/secure/Forbidden.vue'
import Home from '@/views/secure/Home.vue'
import Swal from 'sweetalert2'
import useUserStore from '@/stores/user.js'

import { createRouter, createWebHistory } from 'vue-router'

const routes=[
    ...boardingRoutes,
    ...groomingRoutes,
    ...medicalRoutes,
    ...memberRoutes,
    {path: '/:pathMatch(.*)*',name: 'NotFound',component: NotFound},
    {path:'/403',name:'Forbidden',component:Forbidden},
    {path:'/',name:'Home',component:Home}

  ]
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 每次換頁都捲到最上面（除非是上一頁/下一頁，則回到原本位置）
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由：每次換頁前都會執行
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 這個頁面有標記 requiresAuth: true，而且目前沒有登入
  if (to.meta.requiresAuth && !userStore.token) {
    Swal.fire({
      icon: 'info',
      iconColor: 'rgb(107, 174, 138)',
      title: '請先登入',
      text: '此功能需要登入才能使用',
      confirmButtonText: '前往登入',
      confirmButtonColor:' rgb(107, 174, 138)', 
      showCancelButton: true,
      cancelButtonText: '取消',
      cancelButtonColor: '#a0a09a',
    }).then((result) => {
      if (result.isConfirmed) {
        // 記住用戶原本想去哪，登入後可以導回來
        next({ path: '/member/login', query: { redirect: to.fullPath } })
      } else {
        // 按取消就留在原本的頁面
        next(false)
      }
    })
  } else {
    // 不需要登入，或已經登入，直接放行
    next()
  }
})

export default router
