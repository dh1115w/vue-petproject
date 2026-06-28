import Dashboard from '@/views/medical/Dashboard.vue'
import HealthTracking from '@/views/medical/HealthTracking.vue'
import ClinicSearch from '@/views/medical/ClinicSearch.vue'
import MedicalRecords from '@/views/medical/MedicalRecords.vue'
import CalendarPage from '@/views/medical/CalendarPage.vue'
import TaxiService from '@/views/medical/TaxiService.vue'

const medicalRoutes = [
  { path: '/medical', name: 'Dashboard', component: Dashboard },

// 需要登入才能進入的頁面
  {path: '/medical',name: 'Dashboard',component: Dashboard},
  {path: '/medical/healthtracking',name: 'HealthTracking',component: HealthTracking, meta: { requiresAuth: true }},
  {path: '/medical/clinicsearch',name: 'ClinicSearch',component: ClinicSearch, meta: { requiresAuth: true }},
  {path: '/medical/medicalrecords',name: 'MedicalRecords',component: MedicalRecords, meta: { requiresAuth: true }},
  {path: '/medical/calendarpage',name: 'CalendarPage',component: CalendarPage, meta: { requiresAuth: true }},
  // {path: '/medical/taxiservice',name: 'TaxiService',component: TaxiService, meta: { requiresAuth: true }},

  // 不需要登入（沒加 meta 就是預設不擋）
  { path: '/medical/clinicsearch', name: 'ClinicSearch', component: ClinicSearch },
];

export default medicalRoutes
