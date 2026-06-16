import IndexPage from '../../views/grooming/groomingIndex.vue'
import BookingPage from '@/views/grooming/Booking.vue'
import StaffPage from '@/views/grooming/Staff.vue'
import AppointmentsPage from '@/views/grooming/Appointments.vue'
import ServicesPage from '@/views/grooming/Services.vue'
import ReviewsPage from '@/views/grooming/Reviews.vue'
import StaffDashboard from '@/views/grooming/StaffDashboard.vue';
import GroomingMember from '@/views/grooming/Member.vue'   

const groomingRoutes = [
  { path: '/grooming', name: 'GroomingHome', component: IndexPage },
  { path: '/grooming/booking', name: 'Booking', component: BookingPage },
  { path: '/grooming/services', name: 'GroomingServices', component: ServicesPage },
  { path: '/grooming/staff', name: 'Staff', component: StaffPage },
  { path: '/grooming/reviews', name: 'Reviews', component: ReviewsPage },
  { path: '/grooming/appointments', name: 'Appointments', component: AppointmentsPage },
  { path: '/grooming/StaffDashboard', name: 'StaffDashboard', component: StaffDashboard, meta: { title: '美容師後台' } },
  { path: '/grooming/member', name: 'GroomingMember', component: GroomingMember }   
]


export default groomingRoutes
