import Dashboard from '@/views/medical/Dashboard.vue'
import HealthTracking from '@/views/medical/HealthTracking.vue'
import ClinicSearch from '@/views/medical/ClinicSearch.vue'
import MedicalRecords from '@/views/medical/MedicalRecords.vue'
import CalendarPage from '@/views/medical/CalendarPage.vue'
import TaxiService from '@/views/medical/TaxiService.vue'

const medicalRoutes = [
  {path: '/medical',name: 'Dashboard',component: Dashboard},
  {path: '/medical/healthtracking',name: 'HealthTracking',component: HealthTracking},
  {path: '/medical/clinicsearch',name: 'ClinicSearch',component: ClinicSearch},
  {path: '/medical/medicalrecords',name: 'MedicalRecords',component: MedicalRecords},
  {path: '/medical/calendarpage',name: 'CalendarPage',component: CalendarPage},
  {path: '/medical/taxiservice',name: 'TaxiService',component: TaxiService}
];

export default medicalRoutes
