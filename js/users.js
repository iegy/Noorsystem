/**
 * users.js - إدارة المستخدمين
 */

const UsersModule = (() => {
    const { auth } = FirebaseModule;

    /**
     * فتح مودال المستخدمين
     */
    function openModal() {
        if (FirebaseModule.currentUser?.role !== 'super_admin') return;
        renderList();
        document.getElementById('usersModal').classList.add('active');
    }

    /**
     * عرض قائمة المستخدمين
     */
    async function renderList() {
        const container = document.getElementById('usersList');
        if (!container) return;
        
        try {
            const users = await FirebaseModule.loadAllUsers();
            let html = '';
            users.forEach(user => {
                const roleText = user.role === 'super_admin' ? 'مدير عام' 
                    : (user.role === 'branch_admin' ? 'مدير فرع' : 'موظف');
                html += `
                    <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                        <div>
                            <span class="font-medium text-base dark:text-white">${user.name || user.username}</span>
                            <span class="text-xs text-slate-500 dark:text-slate-400 mr-2">(${user.username})</span>
                            <span class="badge bg-odoo-100 text-odoo-700 dark:bg-odoo-800 dark:text-odoo-200 text-xs px-2 py-0.5 rounded-full mr-2">${roleText}</span>
                            <span class="text-xs text-slate-500">${user.branch || ''}</span>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="UsersModule.editUser('${user.username}')" class="text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 p-1.5 rounded">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button onclick="UsersModule.deleteUser('${user.username}')" class="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>`;
            });
            container.innerHTML = html || '<p class="text-slate-400 text-center">لا يوجد مستخدمين</p>';
        } catch (e) {
            container.innerHTML = '<p class="text-red-500 text-center">فشل تحميل المستخدمين</p>';
        }
    }

    /**
     * إضافة مستخدم جديد
     */
    async function addNewUser() {
        const username = document.getElementById('newUsername').value.trim().toLowerCase();
        const password = document.getElementById('newUserPassword').value;
        const displayName = document.getElementById('newUserDisplayName').value.trim();
        const role = document.getElementById('newUserRole').value;
        const branch = document.getElementById('newUserBranch').value;
        
        if (!username || !password || !displayName) {
            return UI.showAlert('يرجى ملء جميع الحقول');
        }
        if (password.length < 6) {
            return UI.showAlert('كلمة المرور يجب أن تكون 6 خانات على الأقل');
        }
        
        try {
            await auth.createUserWithEmailAndPassword(username + '@noor.com', password);
            await FirebaseModule.saveUser(username, {
                name: displayName,
                role: role,
                branch: role === 'super_admin' ? 'all' : branch
            });
            
            document.getElementById('newUsername').value = '';
            document.getElementById('newUserPassword').value = '';
            document.getElementById('newUserDisplayName').value = '';
            
            renderList();
            UI.showAlert('تم إضافة المستخدم بنجاح');
        } catch (e) {
            UI.showAlert(e.code === 'auth/email-already-in-use' ? 'اسم المستخدم موجود بالفعل' : 'فشل إضافة المستخدم');
        }
    }

    /**
     * تعديل مستخدم
     */
    async function editUser(username) {
        try {
            const user = await FirebaseModule.loadUser(username);
            if (!user) return;
            
            const newName = prompt('الاسم الجديد:', user.name);
            if (newName === null) return;
            
            const roleOptions = ['super_admin', 'branch_admin', 'user'];
            const currentRoleIndex = roleOptions.indexOf(user.role);
            const newRoleIndex = prompt('الدور الجديد:\n0 - مدير عام\n1 - مدير فرع\n2 - موظف', currentRoleIndex);
            if (newRoleIndex === null) return;
            
            const newRole = roleOptions[parseInt(newRoleIndex)] || user.role;
            let newBranch = user.branch;
            
            if (newRole === 'branch_admin' || newRole === 'user') {
                newBranch = prompt('الفرع:', user.branch);
                if (newBranch === null) return;
            } else {
                newBranch = 'all';
            }
            
            await FirebaseModule.saveUser(username, { name: newName, role: newRole, branch: newBranch });
            renderList();
            UI.showAlert('تم تحديث المستخدم بنجاح');
        } catch (e) {
            UI.showAlert('فشل تحديث المستخدم');
        }
    }

    /**
     * حذف مستخدم
     */
    async function deleteUser(username) {
        if (username === 'admin') {
            return UI.showAlert('لا يمكن حذف المدير العام الافتراضي');
        }
        
        UI.showConfirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`, async (ok) => {
            if (ok) {
                try {
                    await FirebaseModule.deleteUser(username);
                    renderList();
                    UI.showAlert('تم حذف المستخدم');
                } catch (e) {
                    UI.showAlert('فشل حذف المستخدم');
                }
            }
        });
    }

    // الواجهة العامة
    return {
        openModal,
        renderList,
        addNewUser,
        editUser,
        deleteUser
    };
})();

window.UsersModule = UsersModule;
