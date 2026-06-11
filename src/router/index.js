import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/grooming'
  },
  {
    path: '/grooming',
    component: () => import('@/views/grooming/GroomingView.vue'),
    children: [
      {
        path: '',
        name: 'GroomingHome',
        component: () => import('@/views/grooming/groomingIndex.vue')
      },
      {
        path: 'appointments',
        name: 'GroomingAppointments',
        component: () => import('@/views/grooming/Appointments.vue')
      },
      {
        path: 'services',
        name: 'GroomingServices',
        component: () => import('@/views/grooming/Services.vue')
      },
      {
        path: 'staff',
        name: 'GroomingStaff',
        component: () => import('@/views/grooming/Staff.vue')
      },
      {
        path: 'reviews',
        name: 'GroomingReviews',
        component: () => import('@/views/grooming/Reviews.vue')
      }
    ]
  },
  {
    path: '/medical',
    children: [
      { path: 'dashboard', name: 'MedicalDashboard', component: () => import('@/views/medical/Dashboard.vue') },
      { path: 'taxiservice', name: 'TaxiService', component: () => import('@/views/medical/TaxiService.vue') },
      { path: 'clinicsearch', name: 'ClinicSearch', component: () => import('@/views/medical/ClinicSearch.vue') },
      { path: 'healthtracking', name: 'HealthTracking', component: () => import('@/views/medical/HealthTracking.vue') },
      { path: 'medicalrecords', name: 'MedicalRecords', component: () => import('@/views/medical/MedicalRecords.vue') },
      { path: 'calendarpage', name: 'CalendarPage', component: () => import('@/views/medical/CalendarPage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router