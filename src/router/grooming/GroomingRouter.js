import IndexPage from '../../views/grooming/groomingIndex.vue'
import BookingPage from '@/views/grooming/Booking.vue'
import StaffPage from '@/views/grooming/Staff.vue'
import AppointmentsPage from '@/views/grooming/Appointments.vue'
import ServicesPage from '@/views/grooming/Services.vue'
import ReviewsPage from '@/views/grooming/Reviews.vue'
import StaffDashboard from '@/views/grooming/StaffDashboard.vue';
import AdminLoginPage from '@/views/grooming/AdminLogin.vue';
import GroomingMember from '@/views/grooming/Member.vue'
import useAdminStore from '@/stores/grooming/admin.js'

// 進這個頁面前先檢查有沒有管理員 token，沒有就導去管理員登入頁
// （只掛在這個路由設定檔自己負責的 StaffDashboard 上，不影響其他組的路由）
function requireAdminLogin(to, from, next) {
  const adminStore = useAdminStore();
  if (!adminStore.token) {
    next({ path: '/grooming/admin-login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
}

const groomingRoutes = [
  { path: '/grooming', name: 'GroomingHome', component: IndexPage },
  { path: '/grooming/booking', name: 'Booking', component: BookingPage },
  { path: '/grooming/services', name: 'GroomingServices', component: ServicesPage },
  { path: '/grooming/staff', name: 'Staff', component: StaffPage },
  { path: '/grooming/reviews', name: 'Reviews', component: ReviewsPage },
  { path: '/grooming/appointments', name: 'Appointments', component: AppointmentsPage },
  { path: '/grooming/admin-login', name: 'AdminLogin', component: AdminLoginPage },
  {
    path: '/grooming/StaffDashboard',
    name: 'StaffDashboard',
    component: StaffDashboard,
    meta: { title: '美容師後台' },
    beforeEnter: requireAdminLogin
  },
  { path: '/grooming/member', name: 'GroomingMember', component: GroomingMember }
]


export default groomingRoutes
