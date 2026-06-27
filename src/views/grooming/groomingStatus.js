// 預約狀態對照表（後端 Appointment.status 0~5），整個美容模組共用這一份，
// 避免每個畫面（Appointments.vue、StaffDashboard.vue…）各自抄一份、改了一邊忘了另一邊。
// label = 畫面顯示的中文；class = 列表彩色徽章的樣式 class
export const appointmentStatusMap = {
  0: { label: '待確認', class: 'badge-info' },
  1: { label: '已確認', class: 'badge-info' },
  2: { label: '美容進行中', class: 'badge-warning' },
  3: { label: '服務已完成', class: 'badge-success' },
  4: { label: '預約已取消', class: 'badge-secondary' },
  5: { label: '未到店', class: 'badge-secondary' }
};