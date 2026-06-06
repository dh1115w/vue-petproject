<script>
export default {
  name: 'NavBar',
  mounted() {
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
  }
}
</script>

<style>
@import '@/css/grooming/nav-bar.css';
</style>
