/**
 * main.js - نقطة البداية الرئيسية للتطبيق
 * ينسق بين جميع الموديولات
 */

// ========== متغيرات عامة ==========
let currentTab = 'main';

// ========== دوال مساعدة عامة ==========

/**
 * إرسال رسالة واتساب
 */
function sendWhatsApp(phone, name) {
    if (!phone || phone === 'غير متوفر') {
        UI.showAlert('رقم الهاتف غير متوفر');
        return;
    }
    let clean = phone.replace(/[^\d]/g, '');
    if (!clean.startsWith('2')) clean = '2' + clean;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(`مرحباً ${name}،\nنود إعلامك بحالة طلبك في نور للبصريات.`)}`, '_blank');
}

/**
 * تبديل التبويب الرئيسي
 */
function switchTab(tab) {
    currentTab = tab;
    
    const mainTab = document.getElementById('mainTabContent');
    const reportsTab = document.getElementById('reportsTabContent');
    const tabMain = document.getElementById('tabMain');
    const tabReports = document.getElementById('tabReports');
    
    if (tab === 'main') {
        if (mainTab) mainTab.classList.remove('hidden');
        if (reportsTab) reportsTab.classList.add('hidden');
        if (tabMain) {
            tabMain.classList.add('font-bold', 'border-b-2', 'border-white');
            tabMain.classList.remove('font-medium', 'text-white/70');
        }
        if (tabReports) {
            tabReports.classList.add('font-medium', 'text-white/70');
            tabReports.classList.remove('font-bold', 'border-b-2', 'border-white');
        }
    } else {
        if (mainTab) mainTab.classList.add('hidden');
        if (reportsTab) reportsTab.classList.remove('hidden');
        if (tabReports) {
            tabReports.classList.add('font-bold', 'border-b-2', 'border-white');
            tabReports.classList.remove('font-medium', 'text-white/70');
        }
        if (tabMain) {
            tabMain.classList.add('font-medium', 'text-white/70');
            tabMain.classList.remove('font-bold', 'border-b-2', 'border-white');
        }
        
        // تحديث التقارير
        if (typeof ReportsModule !== 'undefined' && ReportsModule.renderAllReports) {
            ReportsModule.renderAllReports();
        }
    }
}

/**
 * تحميل الوضع الليلي
 */
function loadDarkMode() {
    const isDark = localStorage.getItem('noor_dark_mode') === 'true';
    const darkModeIcon = document.getElementById('darkModeIcon');
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        if (darkModeIcon) darkModeIcon.className = 'fa-solid fa-sun';
    } else {
        document.documentElement.classList.remove('dark');
        if (darkModeIcon) darkModeIcon.className = 'fa-solid fa-moon';
    }
}

/**
 * تبديل الفرع
 */
function switchBranch(branch) {
    if (BranchesModule && BranchesModule.switchBranch) {
        BranchesModule.switchBranch(branch);
    }
}

/**
 * طباعة الصفحة
 */
function triggerCleanPrint() {
    window.print();
}

// ========== التهيئة عند تحميل الصفحة ==========

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 نظام نور للبصريات - جارٍ التحميل...');
    
    // تحميل الوضع الليلي
    loadDarkMode();
    
    // إظهار شاشة تسجيل الدخول
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    
    // تعيين تاريخ اليوم في نموذج الإضافة
    const orderDateEl = document.getElementById('orderDate');
    if (orderDateEl) {
        orderDateEl.value = new Date().toISOString().split('T')[0];
    }
    
    // ربط الأحداث
    bindEvents();
    
    console.log('✅ نظام نور للبصريات جاهز');
});

/**
 * ربط جميع الأحداث
 */
function bindEvents() {
    // زر تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (typeof AuthModule !== 'undefined' && AuthModule.login) {
                AuthModule.login(e);
            }
        });
    }
    
    // نموذج إضافة طلب
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            if (typeof OrdersModule !== 'undefined' && OrdersModule.addOrder) {
                OrdersModule.addOrder(e);
            }
        });
    }
    
    // نموذج تعديل طلب
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            if (typeof OrdersModule !== 'undefined' && OrdersModule.saveEdit) {
                OrdersModule.saveEdit(e);
            }
        });
    }
    
    // نموذج تغيير كلمة المرور
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            if (typeof AuthModule !== 'undefined' && AuthModule.saveNewPassword) {
                AuthModule.saveNewPassword(e);
            }
        });
    }
    
    // تبديل الفرع
    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
        branchSelect.addEventListener('change', function() {
            switchBranch(this.value);
        });
    }
    
    // البحث
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            if (typeof UI !== 'undefined' && UI.searchOrders) {
                UI.searchOrders();
            }
        });
    }
    
    console.log('🔗 تم ربط جميع الأحداث');
}

// ========== تصدير الدوال العامة ==========
window.switchTab = switchTab;
window.switchBranch = switchBranch;
window.sendWhatsApp = sendWhatsApp;
window.triggerCleanPrint = triggerCleanPrint;
window.loadDarkMode = loadDarkMode;
