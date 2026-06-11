import IndexPage from '../../views/grooming/groomingIndex.vue'
import BookingPage from '@/views/grooming/Booking.vue'
import StaffPage from '@/views/grooming/Staff.vue'
import AppointmentsPage from '@/views/grooming/Appointments.vue'
import ServicesPage from '@/views/grooming/Services.vue'
import ReviewsPage from '@/views/grooming/Reviews.vue'

const groomingRoutes = [
  { path: '/grooming', name: 'GroomingHome', component: IndexPage },
  { path: '/grooming/booking', name: 'Booking', component: BookingPage },
  { path: '/grooming/services', name: 'GroomingServices', component: ServicesPage },
  { path: '/grooming/staff', name: 'Staff', component: StaffPage },
  { path: '/grooming/reviews', name: 'Reviews', component: ReviewsPage },
  { path: '/grooming/appointments', name: 'Appointments', component: AppointmentsPage },
]


export default groomingRoutes