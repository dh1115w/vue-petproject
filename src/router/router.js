import boardingRoutes from '@/router/boarding/BoardingRouter.js'
import groomingRoutes from '@/router/grooming/GroomingRouter.js'
import medicalRoutes from '@/router/medical/MedicalRouter.js'
import memberRoutes from '@/router/member/MemberRouter.js'
import NotFound from '@/views/secure/NotFound.vue'
import Forbidden from '@/views/secure/Forbidden.vue'
import Home from '@/views/secure/Home.vue'

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
  routes
})

export default router
