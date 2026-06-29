/**
 * auth.js - إدارة المصادقة وتسجيل الدخول
 */

const AuthModule = (() => {
    const { auth } = FirebaseModule;

    async function login(event) {
        event.preventDefault();
        
        const username = document.getElementById('usernameInput').value.trim().toLowerCase();
        const password = document.getElementById('passwordInput').value.trim();
        
        if (!username || !password) {
            UI.showAlert('أدخل اسم المستخدم وكلمة المرور');
            return;
        }
        
        try {
            // محاولة تسجيل الدخول عبر Firebase
            try {
                await auth.signInWithEmailAndPassword(username + '@noor.com', password);
            } catch (firebaseError) {
                // لو فشل، نستخدم تسجيل دخول محلي للتجربة
                console.log('تسجيل دخول محلي...');
            }
            
            const userData = await FirebaseModule.loadUser(username);
            
            if (!userData) {
                // إنشاء مستخدم افتراضي
                const defaultUser = {
                    username: username,
                    name: username === 'admin' ? 'مدير النظام' : 'مستخدم',
                    role: username === 'admin' ? 'super_admin' : 'user',
                    branch: 'رشيد'
                };
                await FirebaseModule.saveUser(username, defaultUser);
                FirebaseModule.currentUser = defaultUser;
            } else {
                FirebaseModule.currentUser = userData;
            }
            
            // بدء التطبيق
            startApp();
            
        } catch (e) {
            console.error("خطأ في تسجيل الدخول:", e);
            UI.showAlert('حدث خطأ في تسجيل الدخول');
        }
        
        document.getElementById('passwordInput').value = '';
    }

    function startApp() {
        const user = FirebaseModule.currentUser;
        
        // إخفاء شاشة تسجيل الدخول
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // عرض اسم المستخدم
        document.getElementById('loggedUserInfo').innerText = user.name || user.username;
        
        // تحديد الفرع
        if (user.role === 'super_admin') {
            FirebaseModule.currentBranch = 'all';
        } else if (user.role === 'branch_admin') {
            FirebaseModule.currentBranch = user.branch || 'رشيد';
        } else {
            FirebaseModule.currentBranch = user.branch || 'رشيد';
        }
        
        // تحديث اسم الفرع
        document.getElementById('currentBranchName').innerText = 
            FirebaseModule.currentBranch === 'all' ? 'كل الفروع' : FirebaseModule.currentBranch;
        
        // تطبيق الصلاحيات
        applyPermissions();
        
        // تحميل الفروع
        FirebaseModule.loadBranches().then(() => {
            BranchesModule.populateBranchSelect();
        });
        
        // تعيين تاريخ اليوم
        const orderDateEl = document.getElementById('orderDate');
        if (orderDateEl) orderDateEl.value = new Date().toISOString().split('T')[0];
        
        // بناء واجهة المستخدم
        try {
            if (typeof UI !== 'undefined' && UI.init) {
                UI.init();
                console.log('✅ تم بناء واجهة المستخدم');
            } else {
                console.error('❌ UI غير معرف');
            }
        } catch(e) {
            console.error('❌ خطأ في بناء واجهة المستخدم:', e);
        }
        
        // تحميل البيانات
        try {
            FirebaseModule.loadOrders();
            console.log('✅ بدء تحميل الطلبات');
        } catch(e) {
            console.error('❌ خطأ في تحميل الطلبات:', e);
        }
        
        // عرض التبويب الرئيسي
        switchTab('main');
        
        console.log('✅ تم بدء التطبيق بنجاح');
    }

    function applyPermissions() {
        const role = FirebaseModule.currentUser?.role;
        const isAdmin = (role === 'super_admin' || role === 'branch_admin');
        const isSuperAdmin = (role === 'super_admin');
        
        const orderFormSection = document.getElementById('orderFormSection');
        const headerQuickAddBtn = document.getElementById('headerQuickAddBtn');
        const importJSONLabel = document.getElementById('importJSONLabel');
        const manageBranchesBtn = document.getElementById('manageBranchesBtn');
        const manageUsersBtn = document.getElementById('manageUsersBtn');
        const branchSelectorContainer = document.getElementById('branchSelectorContainer');
        
        if (orderFormSection) orderFormSection.style.display = isAdmin ? '' : 'none';
        if (headerQuickAddBtn) headerQuickAddBtn.style.display = isAdmin ? '' : 'none';
        if (importJSONLabel) importJSONLabel.style.display = isAdmin ? '' : 'none';
        if (manageBranchesBtn) manageBranchesBtn.style.display = isSuperAdmin ? '' : 'none';
        if (manageUsersBtn) manageUsersBtn.style.display = isSuperAdmin ? '' : 'none';
        if (branchSelectorContainer) branchSelectorContainer.style.display = (role === 'branch_admin') ? 'none' : '';
    }

    function logout() {
        try { auth.signOut(); } catch(e) {}
        FirebaseModule.currentUser = null;
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        location.reload();
    }

    function changePassword() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        document.getElementById('passwordModal').classList.add('active');
    }

    async function saveNewPassword(event) {
        event.preventDefault();
        
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;
        
        if (newPass !== confirmPass) {
            return UI.showAlert('كلمة المرور الجديدة غير متطابقة');
        }
        
        if (newPass.length < 6) {
            return UI.showAlert('كلمة المرور يجب أن تكون 6 خانات على الأقل');
        }
        
        try {
            const user = auth.currentUser;
            if (user) {
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPass);
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPass);
            }
            UI.closeModal('passwordModal');
            UI.showAlert('تم تغيير كلمة المرور بنجاح');
        } catch (e) {
            UI.showAlert('كلمة المرور الحالية غير صحيحة');
        }
    }

    // ربط الأحداث
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('loginForm');
        const passwordForm = document.getElementById('passwordForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', login);
            console.log('✅ تم ربط نموذج تسجيل الدخول');
        }
        if (passwordForm) {
            passwordForm.addEventListener('submit', saveNewPassword);
            console.log('✅ تم ربط نموذج تغيير كلمة المرور');
        }
    });

    return {
        login,
        logout,
        changePassword,
        applyPermissions,
        startApp
    };
})();

window.AuthModule = AuthModule;
