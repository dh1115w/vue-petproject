<template>
  <div class="staff-dashboard">
    <h1>美容師後台管理系統</h1>

    <!-- 數據概覽區 -->
    <div class="stats-container">
      <div class="stat-card">
        <span class="stat-label">今日預約</span>
        <span class="stat-value">{{ stats.todayAppts }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">待處理訂單</span>
        <span class="stat-value">{{ stats.pendingOrders }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">平均服務評分</span>
        <span class="stat-value" style="color: #f39c12;">★ {{ stats.avgRating }}</span>
      </div>
    </div>

    <!-- 頁籤切換 -->
    <div class="tab-menu">
      <button :class="{ active: currentTab === 'schedule' }" @click="currentTab = 'schedule'">排班管理</button>
      <button :class="{ active: currentTab === 'calendar' }" @click="currentTab = 'calendar'">月曆視圖</button>
      <button :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">訂單管理</button>
      <button :class="{ active: currentTab === 'blacklist' }" @click="currentTab = 'blacklist'">黑名單管理</button>
      <button :class="{ active: currentTab === 'coupons' }" @click="currentTab = 'coupons'; loadCoupons()">優惠券管理</button>
      <button :class="{ active: currentTab === 'services' }" @click="currentTab = 'services'; loadServices()">服務管理</button>
      <button :class="{ active: currentTab === 'groomers' }" @click="currentTab = 'groomers'; loadGroomers()">美容師管理</button>
      <button :class="{ active: currentTab === 'reviews' }" @click="currentTab = 'reviews'; loadReviews()">評價管理</button>
    </div>

    <!-- 1. 排班管理 -->
    <div v-if="currentTab === 'schedule'" class="content-section">
      <h2>排班管理</h2>

      <!-- 月排班總表：一次排整個月、多位美容師一起 -->
      <div class="month-grid-box">
        <div class="month-grid-toolbar">
          <div class="mg-nav">
            <button @click="changeMonth(-1)" class="btn-page">‹ 上個月</button>
            <span class="mg-title">{{ monthTitle }}</span>
            <button @click="changeMonth(1)" class="btn-page">下個月 ›</button>
          </div>
          <div class="mg-options">
            <label>排班班別
              <select v-model.number="gridShiftId" class="filter-select">
                <option v-for="st in shiftTemplates" :key="st.id" :value="st.id">
                  {{ st.name }}（{{ formatTime(st.startTime) }}~{{ formatTime(st.endTime) }}）
                </option>
              </select>
            </label>
            <label class="mg-check">
              <input v-model="gridSkipMonday" type="checkbox" /> 「排滿整月」時跳過週一（公休）
            </label>
          </div>
        </div>

        <div class="table-container">
          <table class="month-grid">
            <thead>
              <tr>
                <th class="mg-name-col">美容師</th>
                <th v-for="d in monthDays" :key="d.date" class="mg-day-head" :class="{ 'mg-weekend': d.weekend }">
                  <div class="mg-dnum">{{ d.day }}</div>
                  <div class="mg-wk">{{ d.wk }}</div>
                </th>
                <th class="mg-act-col">整列</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="staffList.length === 0">
                <td :colspan="monthDays.length + 2" style="text-align:center;color:#888;">尚未載入美容師名單</td>
              </tr>
              <tr v-for="g in staffList" :key="g.id">
                <td class="mg-name-col">{{ g.name }}</td>
                <td v-for="d in monthDays" :key="d.date"
                    class="mg-cell" :class="cellClass(g.id, d.date)"
                    :title="g.name + ' ' + d.date" @click="toggleCell(g.id, d.date)">
                  {{ cellText(g.id, d.date) }}
                </td>
                <td class="mg-act-col">
                  <button @click="fillRow(g.id)" class="mg-btn">排滿</button>
                  <button @click="clearRow(g.id)" class="mg-btn mg-btn-light">清空</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mg-hint">
          點格子切換「上班（{{ gridShiftName }}）／休假」；「排滿／清空」可整列一次處理。
          顏色：<span class="mg-lg work">上班</span>
          <span class="mg-lg duty">出勤</span>
          <span class="mg-lg leave">請假</span>
          <span class="mg-lg absent">缺勤</span>
          ，空白＝休假。請假、缺勤等單日細部狀態請用下方「單日調整」。
        </p>
      </div>

      <!-- 單日調整：針對某一天，細調每位美容師的班別與狀態（出勤／請假／缺勤）-->
      <h3 class="single-day-title">單日調整（細部狀態）</h3>
      <div class="tool-bar">
        <div class="filter-group">
          <label>選擇日期：</label>
          <input v-model="selectedDate" type="date" class="date-input" @change="onSelectedDateChange" />
        </div>
      </div>
      <p>提示：這裡用來把某位美容師當天改成「出勤／請假／缺勤」，或補排單一天。整月排班請用上面的月表格。</p>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>美容師</th>
            <th>班別</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="scheduleRows.length === 0">
            <td colspan="4" style="text-align: center; color: #888;">尚未載入美容師名單</td>
          </tr>
          <tr v-for="row in scheduleRows" :key="row.groomerId">
            <td>{{ row.groomerName }}</td>
            <td>
              <select v-model.number="row.shiftId" class="filter-select">
                <option :value="null">（未排班）</option>
                <option v-for="st in shiftTemplates" :key="st.id" :value="st.id">
                  {{ st.name }}（{{ formatTime(st.startTime) }}~{{ formatTime(st.endTime) }}）
                </option>
              </select>
            </td>
            <td>
              <select v-model.number="row.status" class="filter-select">
                <option :value="0">排班中</option>
                <option :value="1">出勤</option>
                <option :value="2">請假</option>
                <option :value="3">缺勤</option>
              </select>
            </td>
            <td>
              <button @click="saveScheduleRow(row)" class="btn-primary">儲存</button>
              <span v-if="row.scheduleId" class="schedule-saved-hint">已排班</span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- 1.5 月曆視圖（唯讀總覽：顯示每天有誰排班、狀態顏色，點某天跳到排班分頁）-->
    <div v-if="currentTab === 'calendar'" class="content-section">
      <div class="calendar-container">
        <div class="calendar-header-nav">
          <button @click="changeMonth(-1)" class="nav-btn">
            <i class="fas fa-chevron-left"></i> 上個月
          </button>
          <h2 class="calendar-title">{{ monthTitle }}</h2>
          <button @click="changeMonth(1)" class="nav-btn">
            下個月 <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="calendar-board">
          <div v-for="dayName in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']" :key="dayName" class="calendar-weekday">
            {{ dayName }}
          </div>
          <div
            v-for="(item, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{ 'other-month': !item.date, 'is-today': item.date === todayStr }"
            @click="item.date && jumpToDate(item.date)"
          >
            <div class="day-header">
              <span class="day-num" v-if="item.day">{{ item.day }}</span>
            </div>
            <!-- 當日有幾位美容師排班 -->
            <div v-if="item.count > 0" class="appointment-count-badge">
              {{ item.count }} 人排班
            </div>
            <!-- 美容師排班狀態縮影（顏色點）-->
            <div class="staff-status-list" v-if="item.date">
              <span v-for="staff in item.staffStatus" :key="staff.name"
                    class="staff-chip"
                    :class="staff.status"
                    :title="staff.name + '：' + staff.statusText">{{ staff.name }}</span>
            </div>
          </div>
        </div>

        <div class="calendar-footer">
          <div class="legend-item"><span class="box today-box"></span> 今日</div>
          <div class="legend-item"><span class="dot-sample pending"></span> 排班中</div>
          <div class="legend-item"><span class="dot-sample booked"></span> 出勤</div>
          <div class="legend-item"><span class="dot-sample closed"></span> 請假/缺勤</div>
          <p class="calendar-hint">💡 點擊日期可跳轉至該日排班管理</p>
        </div>
      </div>
    </div>

    <!-- 2. 訂單/預約事項 -->
    <div v-if="currentTab === 'orders'" class="content-section">
      <h2>預約訂單處理</h2>

      <!-- 篩選與搜尋工具欄 -->
      <div class="tool-bar">
        <input v-model="searchQuery" type="text" placeholder="搜尋寵物名稱..." class="search-input" />
        <select v-model="statusFilter" class="filter-select">
          <option value="all">所有狀態</option>
          <option value="0">待確認</option>
          <option value="1">已確認</option>
          <option value="2">美容進行中</option>
          <option value="3">服務已完成</option>
          <option value="4">預約已取消</option>
          <option value="5">未到店</option>
        </select>
      </div>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>訂單 ID</th>
            <th>寵物名稱</th>
            <th>服務項目</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.petName }}</td>
            <td>{{ order.service }}</td>
            <td>{{ orderStatusMap[order.status]?.label || '未知' }}</td>
            <td>
              <button v-if="order.status === 0 || order.status === 1" @click="updateOrderStatus(order.id, 2)" class="btn-primary">開始美容</button>
              <button v-if="order.status === 0 || order.status === 1" @click="updateOrderStatus(order.id, 4)" class="btn-cancel">取消</button>
              <button v-if="order.status === 2" @click="updateOrderStatus(order.id, 3)" class="btn-success">完成美容</button>
              <button class="btn-blacklist" @click="addToBlacklist(order.memberId)">加入黑名單</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- 訂單列表分頁控制 -->
      <div class="pagination-container" v-if="totalOrdersPages > 1">
        <button :disabled="ordersPage === 1" @click="ordersPage--" class="btn-page">上一頁</button>
        <span class="page-info">第 {{ ordersPage }} 頁 / 共 {{ totalOrdersPages }} 頁</span>
        <button :disabled="ordersPage === totalOrdersPages" @click="ordersPage++" class="btn-page">下一頁</button>
      </div>
    </div>

    <!-- 3. 黑名單功能 -->
    <div v-if="currentTab === 'blacklist'" class="content-section">
      <h2>黑名單客戶</h2>
      <table class="admin-table">
        <thead>
          <tr>
            <th>客戶 ID</th>
            <th>姓名</th>
            <th>電話</th>
            <th>類型</th>
            <th>違規原因</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="blacklist.length === 0">
            <td colspan="6" style="text-align: center; color: #888;">目前沒有封鎖中的黑名單客戶</td>
          </tr>
          <tr v-for="item in blacklist" :key="item.id">
            <td>{{ item.userId }}</td>
            <td>{{ item.userName }}</td>
            <td>{{ item.userPhone }}</td>
            <td>{{ item.categoryName }}</td>
            <td>{{ item.reason }}</td>
            <td><button @click="removeBlacklist(item)">解除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 4. 優惠券管理 -->
    <div v-if="currentTab === 'coupons'" class="content-section">
      <h2>優惠券管理</h2>

      <div class="tool-bar">
        <button @click="openCreateCoupon" class="btn-primary">+ 新增優惠券</button>
      </div>

      <!-- 新增/編輯表單（couponFormVisible 為 true 才顯示）-->
      <div v-if="couponFormVisible" class="coupon-form">
        <h3>{{ editingCouponId ? '編輯優惠券' : '新增優惠券' }}</h3>
        <div class="coupon-form-grid">
          <label>優惠碼
            <input v-model="couponForm.code" type="text" placeholder="例：PET80" />
          </label>
          <label>名稱
            <input v-model="couponForm.name" type="text" placeholder="例：全品項8折" />
          </label>
          <label>折扣類型
            <select v-model.number="couponForm.discountType">
              <option :value="1">固定金額（折 NT$）</option>
              <option :value="2">百分比（折掉幾 %）</option>
            </select>
          </label>
          <label>折扣值
            <input v-model.number="couponForm.discountValue" type="number" min="0"
                   :placeholder="couponForm.discountType === 2 ? '例：20 代表打 8 折' : '例：100 代表折 100 元'" />
          </label>
          <label>最低消費門檻
            <input v-model.number="couponForm.minOrderAmount" type="number" min="0" placeholder="沒有就填 0" />
          </label>
          <label>最高折抵金額
            <input v-model.number="couponForm.maxDiscount" type="number" min="0" placeholder="不限就留空" />
          </label>
          <label>總發放數量
            <input v-model.number="couponForm.totalQty" type="number" min="0" placeholder="不限就留空" />
          </label>
          <label>開始日期
            <input v-model="couponForm.startDate" type="date" />
          </label>
          <label>結束日期
            <input v-model="couponForm.endDate" type="date" />
          </label>
          <label>說明
            <input v-model="couponForm.description" type="text" placeholder="選填" />
          </label>
          <label class="coupon-form-checkbox">
            <input v-model="couponForm.isActive" type="checkbox" /> 啟用這張券
          </label>
        </div>
        <div class="coupon-form-actions">
          <button @click="submitCoupon" class="btn-primary">{{ editingCouponId ? '儲存修改' : '確定新增' }}</button>
          <button @click="cancelCouponForm" class="btn-cancel">取消</button>
        </div>
      </div>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>優惠碼</th>
            <th>名稱</th>
            <th>折扣</th>
            <th>最低消費</th>
            <th>使用期間</th>
            <th>已用/總量</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="coupons.length === 0">
            <td colspan="8" style="text-align: center; color: #888;">目前沒有優惠券，按右上角「新增優惠券」建立一張</td>
          </tr>
          <tr v-for="c in coupons" :key="c.id">
            <td>{{ c.code }}</td>
            <td>{{ c.name }}</td>
            <td>{{ formatCouponDiscount(c) }}</td>
            <td>NT$ {{ c.minOrderAmount }}</td>
            <td>{{ formatCouponDate(c.startDate) }} ~ {{ formatCouponDate(c.endDate) }}</td>
            <td>{{ c.usedQty }} / {{ c.totalQty == null ? '不限' : c.totalQty }}</td>
            <td>
              <span :class="c.isActive ? 'status-badge status-pending' : 'status-badge status-closed'">
                {{ c.isActive ? '啟用中' : '已停用' }}
              </span>
            </td>
            <td><button @click="openEditCoupon(c)" class="btn-sm">編輯</button></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div v-if="currentTab === 'services'" class="content-section">
      <h2>服務管理</h2>

      <div class="tool-bar">
        <button @click="openCreateService" class="btn-primary">+ 新增服務</button>
      </div>

      <!-- 新增/編輯表單（serviceFormVisible 為 true 才顯示）-->
      <div v-if="serviceFormVisible" class="coupon-form">
        <h3>{{ editingServiceId ? '編輯服務' : '新增服務' }}</h3>
        <div class="coupon-form-grid">
          <label>服務名稱
            <input v-model="serviceForm.name" type="text" placeholder="例：基礎洗護" />
          </label>
          <label>服務分類
            <select v-model.number="serviceForm.categoryId">
              <option :value="null" disabled>請選擇分類</option>
              <option v-for="cat in serviceCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </label>
          <label>適用物種
            <input v-model="serviceForm.applicableSpecies" type="text" placeholder="貓狗都能用就留空；限定填 dog 或 cat 或 dog,cat" />
          </label>
          <label>說明
            <input v-model="serviceForm.description" type="text" placeholder="選填" />
          </label>
          <label>注意事項
            <input v-model="serviceForm.note" type="text" placeholder="選填" />
          </label>
          <label class="coupon-form-checkbox">
            <input v-model="serviceForm.isActive" type="checkbox" /> 上架（顯示在前台）
          </label>
        </div>

        <h4 style="margin: 16px 0 8px;">各體型定價（沒有提供的體型留空即可）</h4>
        <div class="coupon-form-grid">
          <label>小型 價格
            <input v-model.number="serviceForm.priceSmall" type="number" min="0" placeholder="NT$" />
          </label>
          <label>小型 時長(分)
            <input v-model.number="serviceForm.durationSmall" type="number" min="0" placeholder="分鐘" />
          </label>
          <label>中型 價格
            <input v-model.number="serviceForm.priceMid" type="number" min="0" placeholder="NT$" />
          </label>
          <label>中型 時長(分)
            <input v-model.number="serviceForm.durationMid" type="number" min="0" placeholder="分鐘" />
          </label>
          <label>大型 價格
            <input v-model.number="serviceForm.priceBig" type="number" min="0" placeholder="NT$" />
          </label>
          <label>大型 時長(分)
            <input v-model.number="serviceForm.durationBig" type="number" min="0" placeholder="分鐘" />
          </label>
        </div>

        <div class="coupon-form-actions">
          <button @click="submitService" class="btn-primary">{{ editingServiceId ? '儲存修改' : '確定新增' }}</button>
          <button @click="cancelServiceForm" class="btn-cancel">取消</button>
        </div>
      </div>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>服務名稱</th>
            <th>分類</th>
            <th>適用物種</th>
            <th>各體型價格</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="services.length === 0">
            <td colspan="6" style="text-align: center; color: #888;">目前沒有服務，按右上角「新增服務」建立一個</td>
          </tr>
          <tr v-for="s in services" :key="s.id">
            <td>{{ s.name }}</td>
            <td>{{ categoryName(s.categoryId) }}</td>
            <td>{{ s.applicableSpecies || '不限' }}</td>
            <td>{{ formatPricings(s.pricings) }}</td>
            <td>
              <span :class="s.isActive ? 'status-badge status-pending' : 'status-badge status-closed'">
                {{ s.isActive ? '上架中' : '已下架' }}
              </span>
            </td>
            <td><button @click="openEditService(s)" class="btn-sm">編輯</button></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div v-if="currentTab === 'groomers'" class="content-section">
      <h2>美容師管理</h2>

      <div class="tool-bar">
        <button @click="openCreateGroomer" class="btn-primary">+ 新增美容師</button>
      </div>

      <!-- 新增/編輯表單（groomerFormVisible 為 true 才顯示）-->
      <div v-if="groomerFormVisible" class="coupon-form">
        <h3>{{ editingGroomerId ? '編輯美容師' : '新增美容師' }}</h3>
        <div class="coupon-form-grid">
          <label>姓名
            <input v-model="groomerForm.name" type="text" placeholder="例：王小美" />
          </label>
          <label>電話
            <input v-model="groomerForm.phone" type="text" placeholder="例：0912345678" />
          </label>
          <label>Email
            <input v-model="groomerForm.email" type="email" placeholder="例：abc@example.com" />
          </label>
          <label>性別
            <select v-model="groomerForm.gender">
              <option :value="false">女</option>
              <option :value="true">男</option>
            </select>
          </label>
          <label>生日
            <input v-model="groomerForm.birth" type="date" />
          </label>
          <label>到職日期
            <input v-model="groomerForm.hireDate" type="date" />
          </label>
          <label>年資（年）
            <input v-model.number="groomerForm.experience" type="number" min="0" placeholder="例：5" />
          </label>
          <label>照片網址
            <input v-model="groomerForm.photoUrl" type="text" placeholder="選填" />
          </label>
          <label>個人簡介
            <input v-model="groomerForm.bio" type="text" placeholder="選填" />
          </label>
          <label class="coupon-form-checkbox">
            <input v-model="groomerForm.isActive" type="checkbox" /> 在職（顯示在前台）
          </label>
        </div>

        <h4 style="margin: 16px 0 8px;">專長（可複選）</h4>
        <div class="coupon-form-grid">
          <label v-for="cat in specialtyCategories" :key="cat.id" class="coupon-form-checkbox">
            <input type="checkbox" :value="cat.id" v-model="groomerForm.specialtyIds" /> {{ cat.name }}
          </label>
          <span v-if="specialtyCategories.length === 0" style="color:#888;">（目前沒有可選的專長類別）</span>
        </div>

        <div class="coupon-form-actions">
          <button @click="submitGroomer" class="btn-primary">{{ editingGroomerId ? '儲存修改' : '確定新增' }}</button>
          <button @click="cancelGroomerForm" class="btn-cancel">取消</button>
        </div>
      </div>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>電話</th>
            <th>Email</th>
            <th>性別</th>
            <th>專長</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="groomers.length === 0">
            <td colspan="7" style="text-align: center; color: #888;">目前沒有美容師，按右上角「新增美容師」建立一位</td>
          </tr>
          <tr v-for="g in groomers" :key="g.id">
            <td>{{ g.name }}</td>
            <td>{{ g.phone }}</td>
            <td>{{ g.email }}</td>
            <td>{{ g.gender ? '男' : '女' }}</td>
            <td>{{ g.specialtyText || '—' }}</td>
            <td>
              <span :class="g.isActive ? 'status-badge status-pending' : 'status-badge status-closed'">
                {{ g.isActive ? '在職' : '已離職' }}
              </span>
            </td>
            <td><button @click="openEditGroomer(g)" class="btn-sm">編輯</button></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- 7. 評價管理 -->
    <div v-if="currentTab === 'reviews'" class="content-section">
      <h2>評價管理</h2>

      <!-- 狀態篩選：切換後重新載入清單 -->
      <div class="tool-bar">
        <label>狀態篩選：
          <select v-model="reviewStatusFilter" @change="loadReviews()">
            <option value="all">全部</option>
            <option value="0">待審核</option>
            <option value="1">顯示中</option>
            <option value="2">已隱藏</option>
          </select>
        </label>
      </div>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>會員</th>
            <th>美容師</th>
            <th>評分</th>
            <th>評價內容</th>
            <th>狀態</th>
            <th>店家回覆</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="reviewList.length === 0">
            <td colspan="7" style="text-align: center; color: #888;">目前沒有符合條件的評價</td>
          </tr>
          <tr v-for="r in reviewList" :key="r.id">
            <td>{{ r.userName }}<span v-if="r.isAnonymous" style="color:#888;">（匿名）</span></td>
            <td>{{ r.groomerName || '—' }}</td>
            <td>{{ '★'.repeat(r.overallRating) }} ({{ r.overallRating }})</td>
            <td>{{ r.comment || '—' }}</td>
            <td>
              <span class="status-badge" :class="reviewStatusMap[r.status]?.badge">
                {{ reviewStatusMap[r.status]?.label || '未知' }}
              </span>
            </td>
            <td>{{ r.replyText || '—' }}</td>
            <td>
              <button v-if="r.status !== 1" @click="setReviewStatus(r.id, 1)" class="btn-success">通過</button>
              <button v-if="r.status !== 2" @click="setReviewStatus(r.id, 2)" class="btn-cancel">隱藏</button>
              <button @click="openReply(r)" class="btn-sm">{{ r.replyText ? '修改回覆' : '回覆' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import '@/css/grooming/StaffDashboard.css';
import {
  getAdminStats,
  getAdminOrders,
  updateAdminOrder,
  getBlacklist,
  addToBlacklist as apiAddToBlacklist,
  removeFromBlacklist,
  getGroomers,
  getShiftTemplates,
  getAdminSchedules,
  upsertSchedule as apiUpsertSchedule,
  deleteSchedule as apiDeleteSchedule,
  getCoupons,
  createCoupon as apiCreateCoupon,
  updateCoupon as apiUpdateCoupon,
  getAdminServices,
  getServiceCategories,
  createService as apiCreateService,
  updateService as apiUpdateService,
  getAdminGroomers,
  getSpecialtyCategories,
  createGroomer as apiCreateGroomer,
  updateGroomer as apiUpdateGroomer,
  getAdminReviews,
  moderateReview as apiModerateReview,
  replyToReview as apiReplyToReview
} from './groomingApi';
import { appointmentStatusMap } from './groomingStatus';

// 訂單狀態對照表（跟 Appointments.vue 用同一套，數字才是後端真正的狀態）
const orderStatusMap = appointmentStatusMap;

// 排班狀態對照表（對應後端 GroomerSchedule.status；dot 是月曆上的顏色 class）
const scheduleStatusMap = {
  0: { label: '排班中', dot: 'pending' },
  1: { label: '出勤', dot: 'booked' },
  2: { label: '請假', dot: 'closed' },
  3: { label: '缺勤', dot: 'closed' }
};

// 星期幾的中文簡寫（0=日 ~ 6=六），月表格欄位標頭用
const weekdayShort = ['日', '一', '二', '三', '四', '五', '六'];

// 頁籤狀態
const currentTab = ref('schedule');

// 搜尋與篩選狀態
const searchQuery = ref('');
const statusFilter = ref('all');

// 排班日期選擇 (預設顯示今日)
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const todayStr = new Date().toISOString().split('T')[0];

// 數據概覽（目前仍是後端 mock，之後要做再接）
const stats = ref({ todayAppts: 0, pendingOrders: 0, avgRating: '0.0' });

// 月曆視圖目前查看的月份
const viewDate = ref(new Date());

const monthTitle = computed(() => {
  return viewDate.value.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
});

// 美容師名單（GET /api/groomers）
const staffList = ref([]);
// 班別模板（GET /api/admin/shift-templates）
const shiftTemplates = ref([]);
// 目前載入的排班資料（GET /api/admin/schedules，依檢視月份載入一整個月）
const schedules = ref([]);
// 排班分頁的可編輯列（每位美容師一列：選班別 + 狀態）
const scheduleRows = ref([]);

const orders = ref([]);
const blacklist = ref([]);

// 月曆每一格：當天有幾位美容師排班 + 每位的狀態顏色
const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];
  // 月初前面的空白格
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: null, count: 0 });
  }
  // 當月每一天
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    // 後端 scheduleDate 是 'YYYY-MM-DD' 格式，直接比對
    const daySchedules = schedules.value.filter(s => s.scheduleDate === dateStr);

    const staffStatus = daySchedules.map(s => {
      const info = scheduleStatusMap[s.status] || { label: '未知', dot: 'closed' };
      return { name: s.groomerName, status: info.dot, statusText: info.label };
    });

    days.push({ day: d, date: dateStr, count: daySchedules.length, staffStatus });
  }
  return days;
});

// 月排班表格：當月每一天一欄（含星期、是否週末、是否週一）
const monthDays = computed(() => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const pad = (n) => String(n).padStart(2, '0');
  const total = new Date(y, m + 1, 0).getDate();
  const arr = [];
  for (let d = 1; d <= total; d++) {
    const wkIdx = new Date(y, m, d).getDay();
    arr.push({
      day: d,
      date: `${y}-${pad(m + 1)}-${pad(d)}`,
      wk: weekdayShort[wkIdx],
      weekend: wkIdx === 0 || wkIdx === 6,
      monday: wkIdx === 1
    });
  }
  return arr;
});

// 分頁相關狀態
const itemsPerPage = 5; // 每頁顯示 5 筆
const ordersPage = ref(1);

// ===== 月排班表格用 =====
// 目前要排的班別（預設第一個班別，在 fetchData 載入班別後設定）
const gridShiftId = ref(null);
// 「排滿整月」時是否跳過週一（公休）
const gridSkipMonday = ref(true);

const gridShiftName = computed(() => {
  const st = shiftTemplates.value.find(s => s.id === gridShiftId.value);
  return st ? st.name : '（未選班別）';
});

// 找某位美容師某天的排班資料（找不到回 undefined＝那天休假）
const findSchedule = (groomerId, date) => {
  return schedules.value.find(s => s.groomerId === groomerId && s.scheduleDate === date);
};

// 月表格某格的顏色 class（依排班狀態；沒排班＝休假＝mg-off）
const cellClass = (groomerId, date) => {
  const s = findSchedule(groomerId, date);
  if (!s) return 'mg-off';
  if (s.status === 1) return 'mg-duty';   // 出勤
  if (s.status === 2) return 'mg-leave';  // 請假
  if (s.status === 3) return 'mg-absent'; // 缺勤
  return 'mg-work';                       // 0 排班中
};

// 月表格某格顯示的文字（上班/出勤打勾、請假「假」、缺勤「缺」、休假空白）
const cellText = (groomerId, date) => {
  const s = findSchedule(groomerId, date);
  if (!s) return '';
  if (s.status === 2) return '假';
  if (s.status === 3) return '缺';
  return '✓'; // 0 排班中 / 1 出勤
};

// 依「目前檢視月份」載入整月排班，再重建排班分頁的列表
const loadSchedules = async () => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const pad = (n) => String(n).padStart(2, '0');
  const startDate = `${y}-${pad(m + 1)}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const endDate = `${y}-${pad(m + 1)}-${pad(lastDay)}`;

  try {
    const res = await getAdminSchedules({ startDate, endDate });
    schedules.value = res.data;
  } catch (err) {
    console.error('載入排班失敗:', err);
    schedules.value = [];
  }
  buildScheduleRows();
};

// 用「美容師名單」搭配「當天已有的排班」，組出排班分頁每位美容師一列的可編輯資料
const buildScheduleRows = () => {
  scheduleRows.value = staffList.value.map(g => {
    const existing = schedules.value.find(s => s.groomerId === g.id && s.scheduleDate === selectedDate.value);
    return {
      groomerId: g.id,
      groomerName: g.name,
      scheduleId: existing ? existing.id : null,
      shiftId: existing ? existing.shiftId : null,
      status: existing ? existing.status : 0
    };
  });
};

// 初始化資料載入
const fetchData = async () => {
  try {
    const [statsRes, ordersRes, blacklistRes, groomersRes, shiftRes] = await Promise.all([
      getAdminStats(),
      getAdminOrders(),
      getBlacklist(),
      getGroomers(),
      getShiftTemplates()
    ]);
    stats.value = statsRes.data;
    staffList.value = groomersRes.data;
    shiftTemplates.value = shiftRes.data;
    // 月表格的預設班別 = 第一個班別
    if (shiftTemplates.value.length > 0 && gridShiftId.value == null) {
      gridShiftId.value = shiftTemplates.value[0].id;
    }

    // 格式化 orders（status 保留後端原本的數字 0~5，畫面顯示用 orderStatusMap 轉文字）
    orders.value = ordersRes.data.map(o => ({
      ...o,
      service: o.serviceName
    }));

    blacklist.value = blacklistRes.data;

    // 載入排班（依目前檢視月份）並建立排班列
    await loadSchedules();
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
};

onMounted(fetchData);

// 篩選後的訂單列表
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesSearch = order.petName.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || order.status === parseInt(statusFilter.value);
    return matchesSearch && matchesStatus;
  });
});

// 計算分頁後的訂單列表
const paginatedOrders = computed(() => {
  const start = (ordersPage.value - 1) * itemsPerPage;
  return filteredOrders.value.slice(start, start + itemsPerPage);
});

const totalOrdersPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage) || 1);

// 當搜尋或篩選條件改變時，自動回到第一頁
watch([searchQuery, statusFilter], () => {
  ordersPage.value = 1;
});

// 把後端的 TIME 字串（09:00:00）顯示成 09:00
const formatTime = (t) => {
  return t ? String(t).slice(0, 5) : '';
};

// 點月表格某一格：在「上班」與「休假」之間切換
// 目前是排班中(0) → 刪掉排班變休假；其它狀態(休假/請假/缺勤/出勤) → 改成上班(排班中)
const toggleCell = async (groomerId, date) => {
  if (!gridShiftId.value) { alert('請先在上方選擇排班班別'); return; }
  const s = findSchedule(groomerId, date);
  try {
    if (s && s.status === 0) {
      await apiDeleteSchedule({ groomer_id: groomerId, date });
    } else {
      await apiUpsertSchedule({ groomerId, shiftId: gridShiftId.value, scheduleDate: date, status: 0 });
    }
    await loadSchedules();
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '更新排班失敗';
    alert(message);
  }
};

// 整列「排滿」：把這位美容師整月都排成上班（可跳過週一）。
// 已是請假/缺勤/出勤的特例格子不覆蓋，只動「沒排班」或「排班中」的。
const fillRow = async (groomerId) => {
  if (!gridShiftId.value) { alert('請先在上方選擇排班班別'); return; }
  const targets = monthDays.value.filter(d => {
    if (gridSkipMonday.value && d.monday) return false;
    const s = findSchedule(groomerId, d.date);
    return !s; // 只補「目前休假（沒排班）」的日子，其它狀態都不動
  });
  if (targets.length === 0) { alert('這個月沒有需要補排的日期'); return; }
  await Promise.allSettled(targets.map(d =>
    apiUpsertSchedule({ groomerId, shiftId: gridShiftId.value, scheduleDate: d.date, status: 0 })
  ));
  await loadSchedules();
};

// 整列「清空」：把這位美容師整月「排班中」的日子都改成休假（刪排班）。
// 已有預約的日子後端會擋，這裡統計失敗筆數提示。
const clearRow = async (groomerId) => {
  if (!confirm('確定把這位美容師整個月都清成休假嗎？（已有預約的日子會被跳過）')) return;
  const targets = monthDays.value.filter(d => {
    const s = findSchedule(groomerId, d.date);
    return s && s.status === 0; // 只刪「排班中」的；請假/缺勤/出勤、本來就沒排的略過
  });
  if (targets.length === 0) { alert('這個月沒有可清空的排班'); return; }
  const results = await Promise.allSettled(targets.map(d =>
    apiDeleteSchedule({ groomer_id: groomerId, date: d.date })
  ));
  const fail = results.filter(r => r.status === 'rejected').length;
  await loadSchedules();
  if (fail) alert(`有 ${fail} 天因為已有預約等原因無法清空`);
};

// 儲存某位美容師當天的排班（呼叫真實 upsert API）
const saveScheduleRow = async (row) => {
  if (!row.shiftId) {
    alert('請先選擇班別（未排班的話就不用儲存）');
    return;
  }
  try {
    await apiUpsertSchedule({
      groomerId: row.groomerId,
      shiftId: row.shiftId,
      scheduleDate: selectedDate.value,
      status: row.status
    });
    await loadSchedules(); // 重新載入，列表才會顯示「已排班」
    alert(`已儲存 ${row.groomerName} 於 ${selectedDate.value} 的排班`);
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '儲存排班失敗';
    alert(message);
  }
};

// 切換日期時：跳到該日期所屬月份、重新載入該月排班並重建列表
const onSelectedDateChange = () => {
  const d = new Date(selectedDate.value);
  viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1);
  loadSchedules();
};

// 月曆導航（換月後重新載入該月排班）
const changeMonth = (offset) => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + offset, 1);
  loadSchedules();
};

// 從月曆點某天 → 跳到排班分頁、帶入該日期
const jumpToDate = (date) => {
  selectedDate.value = date;
  currentTab.value = 'schedule';
  buildScheduleRows();
};

// 功能邏輯（newStatus 是數字：0待確認 1已確認 2進行中 3已完成 4已取消 5未到店）
const updateOrderStatus = async (id, newStatus) => {
  if (newStatus === 4 && !confirm('確定要取消這筆預約嗎？這將會釋放排班時段供其他客戶預約。')) {
    return;
  }

  try {
    await updateAdminOrder(id, newStatus);
    await fetchData(); // 重新整理資料
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '更新訂單失敗';
    alert(message);
  }
};

// 把某個會員加入黑名單（memberId 來自訂單資料 order.memberId）
const addToBlacklist = async (memberId) => {
  if (!memberId) {
    alert('找不到這筆訂單的會員 ID，無法加入黑名單');
    return;
  }
  const reason = prompt('請輸入加入黑名單的原因：');
  if (!reason) return; // 使用者按取消或沒填原因就不做
  try {
    // 後端要的欄位是 memberId（不是 userId）
    await apiAddToBlacklist({ memberId, reason });
    alert(`會員 ${memberId} 已加入黑名單`);
    await fetchData(); // 重新載入，黑名單分頁才會看到這筆
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '加入黑名單失敗';
    alert(message);
  }
};

// 解除某筆黑名單（item.id 是黑名單紀錄的 id，不是會員 id）
const removeBlacklist = async (item) => {
  if (!confirm(`確定要把 ${item.userName || ('會員' + item.userId)} 從黑名單解除嗎？`)) return;
  try {
    await removeFromBlacklist(item.id);
    await fetchData(); // 重新載入列表（解除後就不會再出現在封鎖中清單）
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '解除黑名單失敗';
    alert(message);
  }
};

// ===== 優惠券管理分頁 =====
const coupons = ref([]);
const couponFormVisible = ref(false);
const editingCouponId = ref(null); // null = 新增模式，有值 = 正在編輯第幾張券

// 表單欄位的預設值（新增時用這個重置）
const blankCouponForm = () => ({
  code: '',
  name: '',
  description: '',
  discountType: 1,
  discountValue: null,
  minOrderAmount: 0,
  maxDiscount: null,
  totalQty: null,
  startDate: '',
  endDate: '',
  isActive: true
});
const couponForm = ref(blankCouponForm());

// 載入優惠券清單（切到「優惠券管理」分頁時呼叫）
const loadCoupons = async () => {
  try {
    const res = await getCoupons();
    coupons.value = res.data;
  } catch (err) {
    console.error('載入優惠券失敗:', err);
  }
};

// 打開「新增」表單
const openCreateCoupon = () => {
  editingCouponId.value = null;
  couponForm.value = blankCouponForm();
  couponFormVisible.value = true;
};

// 打開「編輯」表單，把那張券的資料帶進表單
const openEditCoupon = (c) => {
  editingCouponId.value = c.id;
  couponForm.value = {
    code: c.code,
    name: c.name,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderAmount: c.minOrderAmount,
    maxDiscount: c.maxDiscount,
    totalQty: c.totalQty,
    startDate: c.startDate ? c.startDate.split('T')[0] : '',
    endDate: c.endDate ? c.endDate.split('T')[0] : '',
    isActive: c.isActive
  };
  couponFormVisible.value = true;
};

const cancelCouponForm = () => {
  couponFormVisible.value = false;
};

// 送出表單：依模式呼叫新增或編輯 API
const submitCoupon = async () => {
  try {
    if (editingCouponId.value) {
      await apiUpdateCoupon(editingCouponId.value, couponForm.value);
    } else {
      await apiCreateCoupon(couponForm.value);
    }
    couponFormVisible.value = false;
    await loadCoupons();
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '儲存優惠券失敗';
    alert(message);
  }
};

// 把折扣資訊組成好讀的文字
const formatCouponDiscount = (c) => {
  if (c.discountType === 1) {
    return '折 NT$ ' + c.discountValue;
  }
  return '折 ' + c.discountValue + '%';
};

// 把後端 ISO 日期字串轉成 yyyy-mm-dd 顯示
const formatCouponDate = (isoStr) => {
  return isoStr ? isoStr.split('T')[0] : '';
};

// ===== 服務管理分頁 =====
const services = ref([]);
const serviceCategories = ref([]);
const serviceFormVisible = ref(false);
const editingServiceId = ref(null); // null = 新增模式，有值 = 正在編輯哪個服務

// 表單預設值（新增時用這個重置）
const blankServiceForm = () => ({
  categoryId: null,
  name: '',
  description: '',
  applicableSpecies: '',
  note: '',
  isActive: true,
  // 三種體型的價格/時長分開填，送出時再組成 pricings 陣列
  priceSmall: null, durationSmall: null,
  priceMid: null, durationMid: null,
  priceBig: null, durationBig: null
});
const serviceForm = ref(blankServiceForm());

// 載入服務清單 + 分類（切到「服務管理」分頁時呼叫）
const loadServices = async () => {
  try {
    const [svcRes, catRes] = await Promise.all([getAdminServices(), getServiceCategories()]);
    services.value = svcRes.data;
    serviceCategories.value = catRes.data;
  } catch (err) {
    console.error('載入服務失敗:', err);
  }
};

// 依 categoryId 找分類名稱（清單顯示用）
const categoryName = (id) => {
  const cat = serviceCategories.value.find(c => c.id === id);
  return cat ? cat.name : '—';
};

// 把各體型定價組成好讀的文字
const formatPricings = (pricings) => {
  if (!pricings || pricings.length === 0) return '—';
  const label = { 1: '小', 2: '中', 3: '大' };
  return pricings
    .slice()
    .sort((a, b) => a.size - b.size)
    .map(p => `${label[p.size] || p.size} $${p.price}/${p.duration}分`)
    .join('、');
};

// 把表單三組體型欄位組成後端要的 pricings 陣列（有填價格的才算）
const buildPricings = (f) => {
  const list = [];
  if (f.priceSmall) list.push({ size: 1, price: f.priceSmall, duration: f.durationSmall });
  if (f.priceMid) list.push({ size: 2, price: f.priceMid, duration: f.durationMid });
  if (f.priceBig) list.push({ size: 3, price: f.priceBig, duration: f.durationBig });
  return list;
};

// 打開「新增」表單
const openCreateService = () => {
  editingServiceId.value = null;
  serviceForm.value = blankServiceForm();
  serviceFormVisible.value = true;
};

// 打開「編輯」表單，把該服務資料帶進表單
const openEditService = (s) => {
  editingServiceId.value = s.id;
  const f = blankServiceForm();
  f.categoryId = s.categoryId;
  f.name = s.name;
  f.description = s.description;
  f.applicableSpecies = s.applicableSpecies || '';
  f.note = s.note;
  f.isActive = s.isActive;
  (s.pricings || []).forEach(p => {
    if (p.size === 1) { f.priceSmall = p.price; f.durationSmall = p.duration; }
    else if (p.size === 2) { f.priceMid = p.price; f.durationMid = p.duration; }
    else if (p.size === 3) { f.priceBig = p.price; f.durationBig = p.duration; }
  });
  serviceForm.value = f;
  serviceFormVisible.value = true;
};

const cancelServiceForm = () => {
  serviceFormVisible.value = false;
};

// 送出表單：依模式呼叫新增或編輯 API
const submitService = async () => {
  try {
    const payload = {
      categoryId: serviceForm.value.categoryId,
      name: serviceForm.value.name,
      description: serviceForm.value.description,
      applicableSpecies: serviceForm.value.applicableSpecies,
      note: serviceForm.value.note,
      isActive: serviceForm.value.isActive,
      pricings: buildPricings(serviceForm.value)
    };
    if (editingServiceId.value) {
      await apiUpdateService(editingServiceId.value, payload);
    } else {
      await apiCreateService(payload);
    }
    serviceFormVisible.value = false;
    await loadServices();
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '儲存服務失敗';
    alert(message);
  }
};

// ===== 美容師管理分頁 =====
const groomers = ref([]);
const specialtyCategories = ref([]);
const groomerFormVisible = ref(false);
const editingGroomerId = ref(null); // null = 新增模式，有值 = 正在編輯哪位

// 表單預設值（新增時用這個重置）
const blankGroomerForm = () => ({
  name: '',
  phone: '',
  email: '',
  gender: false,
  birth: '',
  hireDate: '',
  photoUrl: '',
  bio: '',
  experience: null,
  isActive: true,
  specialtyIds: []
});
const groomerForm = ref(blankGroomerForm());

// 載入美容師清單 + 專長類別（切到「美容師管理」分頁時呼叫）
const loadGroomers = async () => {
  try {
    const [gRes, sRes] = await Promise.all([getAdminGroomers(), getSpecialtyCategories()]);
    groomers.value = gRes.data;
    specialtyCategories.value = sRes.data;
  } catch (err) {
    console.error('載入美容師失敗:', err);
  }
};

// 打開「新增」表單
const openCreateGroomer = () => {
  editingGroomerId.value = null;
  groomerForm.value = blankGroomerForm();
  groomerFormVisible.value = true;
};

// 打開「編輯」表單，把該美容師資料帶進表單
const openEditGroomer = (g) => {
  editingGroomerId.value = g.id;
  groomerForm.value = {
    name: g.name,
    phone: g.phone,
    email: g.email,
    gender: g.gender,
    birth: g.birth ? g.birth.split('T')[0] : '',
    hireDate: g.hireDate ? g.hireDate.split('T')[0] : '',
    photoUrl: g.photoUrl,
    bio: g.bio,
    experience: g.experience,
    isActive: g.isActive,
    specialtyIds: g.specialtyIds ? [...g.specialtyIds] : []
  };
  groomerFormVisible.value = true;
};

const cancelGroomerForm = () => {
  groomerFormVisible.value = false;
};

// 送出表單：依模式呼叫新增或編輯 API
const submitGroomer = async () => {
  try {
    if (editingGroomerId.value) {
      await apiUpdateGroomer(editingGroomerId.value, groomerForm.value);
    } else {
      await apiCreateGroomer(groomerForm.value);
    }
    groomerFormVisible.value = false;
    await loadGroomers();
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '儲存美容師失敗';
    alert(message);
  }
};

// ===== 評價管理分頁 =====
// 評價狀態對照（對應後端 Review.status；badge 是徽章顏色 class）
const reviewStatusMap = {
  0: { label: '待審核', badge: 'status-pending' },
  1: { label: '顯示中', badge: 'status-completed' },
  2: { label: '已隱藏', badge: 'status-cancelled' }
};

const reviewList = ref([]);
// 篩選用：'all' 看全部，'0'/'1'/'2' 只看某個狀態
const reviewStatusFilter = ref('all');

// 載入評價清單（切到「評價管理」分頁、或切換狀態篩選時呼叫）
const loadReviews = async () => {
  try {
    // 'all' → 不帶狀態（後端回全部）；其他要轉成數字傳給後端
    const status = reviewStatusFilter.value === 'all' ? null : Number(reviewStatusFilter.value);
    const res = await getAdminReviews(status);
    reviewList.value = res.data;
  } catch (err) {
    console.error('載入評價失敗:', err);
  }
};

// 審核：把評價設成 1顯示 或 2隱藏
const setReviewStatus = async (id, status) => {
  try {
    await apiModerateReview(id, status);
    await loadReviews(); // 重新載入，狀態才會更新
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '更新評價狀態失敗';
    alert(message);
  }
};

// 店家回覆：用 prompt 跳出輸入框，已有回覆的話帶入舊內容供修改
const openReply = async (review) => {
  const content = prompt('輸入店家回覆：', review.replyText || '');
  if (content === null) return;      // 按取消就不做
  if (!content.trim()) {             // 空白擋下來，跟後端規則一致
    alert('回覆內容不能空白');
    return;
  }
  try {
    await apiReplyToReview(review.id, content);
    await loadReviews(); // 重新載入，才看得到回覆
  } catch (err) {
    const message = err.response && err.response.data ? err.response.data : '送出回覆失敗';
    alert(message);
  }
};</script>

<style scoped>
/* 內嵌美化樣式，可視需求移至 StaffDashboard.css */
.calendar-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 24px;
  margin-top: 10px;
}

.calendar-header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.calendar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2a2522;
  letter-spacing: 1px;
}

.nav-btn {
  background: #f8f7f5;
  border: 1px solid #e8e8e6;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #888;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: #2a2522;
  color: #fff;
}

.calendar-board {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e8e8e6;
  border: 1px solid #e8e8e6;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekday {
  background: #fdfdfd;
  padding: 12px;
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: #b0b0aa;
  text-transform: uppercase;
}

.calendar-day {
  background: #fff;
  min-height: 125px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.calendar-day:hover:not(.other-month) {
  background: #fffcf5;
}

.calendar-day.other-month {
  background: #fcfcfc;
  cursor: default;
  opacity: 0.3;
}

.calendar-day.is-today {
  background: #fff9e6;
}
.calendar-day.is-today .day-num {
  background: #2a2522;
  color: #fff;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.day-num {
  font-weight: 600;
  color: #444;
}

.appointment-count-badge {
  margin-top: 5px;
  font-size: 0.7rem;
  color: #e67e22;
  font-weight: bold;
}

.staff-status-list {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 8px;
}

.staff-chip {
  font-size: 0.68rem;
  line-height: 1;
  padding: 3px 8px;
  border-radius: 999px;
  color: #fff;
  background: #b0b0aa;
  white-space: nowrap;
}

.staff-chip.pending { background: #27ae60; } /* 綠: 排班中 */
.staff-chip.booked { background: #2980b9; }  /* 藍: 出勤 */
.staff-chip.closed { background: #c0392b; }  /* 紅: 請假/缺勤 */

.dot-sample {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot-sample.pending { background: #2ecc71; }
.dot-sample.booked { background: #3498db; }
.dot-sample.closed { background: #e74c3c; }

.calendar-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.legend-item {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.today-box { background: #fff9e6; border: 1px solid #ffeeba; }

.calendar-hint {
  margin-left: auto;
  font-size: 0.85rem;
  color: #b0b0aa;
}

.schedule-saved-hint {
  margin-left: 8px;
  font-size: 0.75rem;
  color: #27ae60;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  transition: background 0.3s;
}
.btn-cancel:hover {
  background-color: #7f8c8d;
}

.coupon-form {
  background: #fff;
  border: 1px solid #e8e8e6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}
.coupon-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
}
.coupon-form-grid label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: #555;
  gap: 4px;
}
.coupon-form-grid input,
.coupon-form-grid select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.coupon-form-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.coupon-form-checkbox input {
  width: auto;
}
.coupon-form-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

/* ===== 月排班表格 ===== */
.month-grid-box {
  background: #fff;
  border: 1px solid #e8e8e6;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 22px;
}
.month-grid-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.mg-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mg-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2a2522;
  min-width: 120px;
  text-align: center;
}
.mg-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.mg-options label {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  color: #555;
  gap: 4px;
}
.mg-check {
  flex-direction: row !important;
  align-items: center;
  gap: 6px !important;
}
.mg-check input { width: auto; }

.month-grid {
  border-collapse: collapse;
  font-size: 0.8rem;
}
.month-grid th,
.month-grid td {
  border: 1px solid #eee;
  text-align: center;
}
.mg-name-col {
  position: sticky;
  left: 0;
  background: #faf9f7;
  z-index: 1;
  min-width: 72px;
  padding: 6px 10px;
  font-weight: 600;
  text-align: left;
}
.mg-day-head {
  padding: 4px 0;
  width: 30px;
  color: #666;
}
.mg-dnum { font-weight: 600; }
.mg-wk { font-size: 0.62rem; color: #aaa; }
.mg-day-head.mg-weekend { color: #c0392b; background: #fdf4f3; }
.mg-act-col {
  min-width: 96px;
  padding: 4px 6px;
  white-space: nowrap;
}

.mg-cell {
  width: 30px;
  height: 30px;
  cursor: pointer;
  user-select: none;
  color: #fff;
  font-weight: 700;
}
.mg-cell.mg-off { background: #fff; color: transparent; }
.mg-cell.mg-off:hover { background: #eafaf0; }
.mg-cell.mg-work { background: #27ae60; }   /* 綠: 排班中（上班）*/
.mg-cell.mg-duty { background: #2980b9; }   /* 藍: 出勤 */
.mg-cell.mg-leave { background: #e67e22; }  /* 橘: 請假 */
.mg-cell.mg-absent { background: #c0392b; } /* 紅: 缺勤 */

.mg-btn {
  background: #2a2522;
  color: #fff;
  border: none;
  padding: 3px 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.72rem;
  margin-right: 4px;
}
.mg-btn-light { background: #95a5a6; }

.single-day-title {
  margin: 6px 0 10px;
  font-size: 1.05rem;
  color: #2a2522;
}

.mg-hint {
  margin: 12px 0 0;
  font-size: 0.78rem;
  color: #888;
  line-height: 1.9;
}
.mg-lg {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.7rem;
  margin: 0 2px;
}
.mg-lg.work { background: #27ae60; }
.mg-lg.duty { background: #2980b9; }
.mg-lg.leave { background: #e67e22; }
.mg-lg.absent { background: #c0392b; }
</style>