/**
 * config.js - الإعدادات العامة للتطبيق
 */

// إعدادات Firebase
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCWOz9GlOG3aiYQLRoYgS13EjcNB0-zoBY",
    authDomain: "noor-eye-wear.firebaseapp.com",
    projectId: "noor-eye-wear",
    storageBucket: "noor-eye-wear.firebasestorage.app",
    messagingSenderId: "156053003295",
    appId: "1:156053003295:web:0012ac11f6b4a62a6fc92a"
};

// إعدادات الصفحات
const PAGE_SIZE = 30;

// الفروع الافتراضية
const DEFAULT_BRANCHES = ['رشيد', 'سموحة', 'دمنهور'];

// أنواع الطلبات
const ORDER_TYPES = [
    'نظارة وعدسات جديدة',
    'عدسات فقط',
    'صيانة فقط'
];

// حالات التواجد
const ORDER_STATUSES = [
    'في المكتب',
    'بالمحل'
];

// حالات التسليم
const DELIVERY_STATUSES = [
    'لم يتم',
    'تم التسليم'
];

// أدوار المستخدمين
const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    BRANCH_ADMIN: 'branch_admin',
    USER: 'user'
};

// تعريف الأعمدة
const ALL_COLUMNS = [
    { id: 'date', name: 'التاريخ', visible: true },
    { id: 'soNumber', name: 'رقم SO', visible: true },
    { id: 'name', name: 'اسم العميل', visible: true },
    { id: 'phone', name: 'رقم الهاتف', visible: true },
    { id: 'type', name: 'النوع', visible: true },
    { id: 'total', name: 'الإجمالي', visible: true },
    { id: 'paid', name: 'المدفوع', visible: true },
    { id: 'remaining', name: 'المتبقي', visible: true },
    { id: 'status', name: 'التواجد', visible: true },
    { id: 'delivery', name: 'التسليم', visible: true },
    { id: 'notes', name: 'ملاحظات', visible: true },
    { id: 'days', name: 'الأيام', visible: true }
];

// تصدير المتغيرات العامة
window.APP_CONFIG = {
    FIREBASE_CONFIG,
    PAGE_SIZE,
    DEFAULT_BRANCHES,
    ORDER_TYPES,
    ORDER_STATUSES,
    DELIVERY_STATUSES,
    USER_ROLES,
    ALL_COLUMNS
};
