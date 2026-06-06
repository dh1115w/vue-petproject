import MemberView from '@/views/member/MemberView.vue'
import LoginView from '@/views/member/LoginView.vue'
import CreateAccountView from '@/views/member/CreateAccountView.vue'
import UpadteProfileView from '@/views/member/UpdateProfileView.vue'

const memberRoutes = [
  {path: '/member/member',name: 'Member',component: MemberView},
  {path:'/member/login',name:'Login',component:LoginView},
  {path:'/member/createaccount',name:'CreateAccount',component:CreateAccountView},
  {path:'/member/updateprofile',name:'UpdateProfile',component:UpadteProfileView}
];

export default memberRoutes
