import IndexPage from '@/views/grooming/grommingIndex.vue'
import BookingPage from '@/views/grooming/Booking.vue'
import StaffPage from '@/views/grooming/Staff.vue'
import MemberPage from '@/views/grooming/Member.vue'
import ServicesPage from '@/views/grooming/Services.vue'
import ReviewsPage from '@/views/grooming/Reviews.vue'

const groomingRoutes = [
  { path: '/grooming', name: 'GroomingHome', component: IndexPage },
  { path: '/grooming/booking', name: 'Booking', component: BookingPage },
  { path: '/grooming/services', name: 'GroomingServices', component: ServicesPage },
  { path: '/grooming/staff', name: 'Staff', component: StaffPage },
  { path: '/grooming/reviews', name: 'Reviews', component: ReviewsPage },
  { path: '/grooming/member', name: 'GroomingMember', component: MemberPage },
]


export default groomingRoutes