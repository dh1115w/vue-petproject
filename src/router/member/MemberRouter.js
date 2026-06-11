import MemberView from '@/views/member/MemberView.vue'
import LoginView from '@/views/member/LoginView.vue'
import CreateAccountView from '@/views/member/CreateAccountView.vue'
import UpadteProfileView from '@/views/member/UpdateProfileView.vue'
import ForgetPassword from '@/views/member/ForgetPassword.vue'
import UpdatePassword from '@/views/member/UpdatePassword.vue'


const memberRoutes = [
  {path: '/member/member',name: 'Member',component: MemberView},
  {path:'/member/login',name:'Login',component:LoginView},
  {path:'/member/createaccount',name:'CreateAccount',component:CreateAccountView},
  {path:'/member/updateprofile',name:'UpdateProfile',component:UpadteProfileView},
  {path:'/member/forgetpassword',name:'ForgetPassword',component:ForgetPassword},
  {path:'/member/updatepassword',name:"UpdatePassword",component:UpdatePassword}
];

export default memberRoutes
