/**
 * auth.js - إدارة المصادقة وتسجيل الدخول
 */

const AuthModule = (() => {
    const { auth } = FirebaseModule;

    /**
     * تسجيل الدخول
     */
    async function login(event) {
        event.preventDefault();
        
        const username = document.getElementById('usernameInput').value.trim().toLowerCase();
        const password = document.getElementById('passwordInput').value.trim();
        
        try {
            await auth.signInWithEmailAndPassword(username + '@noor.com', password);
            const userData = await FirebaseModule.loadUser(username);
            
            if (!userData) {
                await auth.signOut();
                UI.showAlert('بيانات المستخدم غير موجودة.');
                return;
            }
            
            FirebaseModule.currentUser = userData;
            
            // تحديد الفرع الحالي
            if (userData.role === 'super_admin') {
                FirebaseModule.currentBranch = 'all';
            } else if (userData.role === 'branch_admin') {
                FirebaseModule.currentBranch = userData.branch;
            } else {
                FirebaseModule.currentBranch = FirebaseModule.branches[0] || 'رشيد';
            }
            
            // تحميل الفروع
            await FirebaseModule.loadBranches();
            
            // تحميل إعدادات الأعمدة
            const savedColumns = await FirebaseModule.loadColumnSettings(username);
            if (savedColumns) {
                savedColumns.forEach(s => {
                    const col = ALL_COLUMNS.find(c => c.id === s.id);
                    if (col) col.visible = s.visible;
                });
            }
            
            // بدء التطبيق
            startApp();
            
        } catch (e) {
            console.error("خطأ في تسجيل الدخول:", e);
            UI.showAlert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
        
        document.getElementById('passwordInput').value = '';
    }

    /**
     * بدء التطبيق بعد تسجيل الدخول
     */
    function startApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        const user = FirebaseModule.currentUser;
        document.getElementById('loggedUserInfo').innerText = user.name;
        
        // تطبيق الصلاحيات
        applyPermissions();
        
        // تحديث اسم الفرع
        document.getElementById('currentBranchName').innerText = 
            FirebaseModule.currentBranch === 'all' ? 'كل الفروع' : FirebaseModule.currentBranch;
        
        // تعيين تاريخ اليوم
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        
        // تحميل البيانات
        FirebaseModule.loadOrders();
        
        // بناء واجهة المستخدم
        UI.init();
        
        // عرض التبويب الرئيسي
        switchTab('main');
    }

    /**
     * تطبيق الصلاحيات
     */
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

    /**
     * تسجيل الخروج
     */
    function logout() {
        if (FirebaseModule.unsubscribeListener) {
            FirebaseModule.unsubscribeListener();
        }
        auth.signOut();
        FirebaseModule.currentUser = null;
        FirebaseModule.orders = [];
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
    }

    /**
     * تغيير كلمة المرور
     */
    function changePassword() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        document.getElementById('passwordModal').classList.add('active');
    }

    /**
     * حفظ كلمة المرور الجديدة
     */
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
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPass);
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPass);
            UI.closeModal('passwordModal');
            UI.showAlert('تم تغيير كلمة المرور بنجاح');
        } catch (e) {
            UI.showAlert('كلمة المرور الحالية غير صحيحة');
        }
    }

    // ربط الأحداث
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('passwordForm').addEventListener('submit', saveNewPassword);

    // الواجهة العامة
    return {
        login,
        logout,
        changePassword,
        applyPermissions,
        startApp
    };
})();

window.AuthModule = AuthModule;
