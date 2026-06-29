/**
 * branches.js - إدارة الفروع
 */

const BranchesModule = (() => {

    /**
     * فتح مودال الفروع
     */
    function openModal() {
        if (FirebaseModule.currentUser?.role !== 'super_admin') return;
        renderList();
        document.getElementById('branchesModal').classList.add('active');
    }

    /**
     * عرض قائمة الفروع
     */
    function renderList() {
        const container = document.getElementById('branchesList');
        if (!container) return;
        
        container.innerHTML = FirebaseModule.branches.map((b, idx) => `
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <span class="font-medium text-base dark:text-white">${b}</span>
                <div class="flex gap-1">
                    <button onclick="BranchesModule.editBranch(${idx})" class="text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 p-1.5 rounded">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="BranchesModule.deleteBranch(${idx})" class="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * إضافة فرع جديد
     */
    async function addBranch() {
        const name = document.getElementById('newBranchName').value.trim();
        if (!name) return UI.showAlert('أدخل اسم الفرع');
        if (FirebaseModule.branches.includes(name)) return UI.showAlert('الفرع موجود');
        
        FirebaseModule.branches.push(name);
        await FirebaseModule.saveBranches(FirebaseModule.branches);
        
        document.getElementById('newBranchName').value = '';
        populateBranchSelect();
        renderList();
    }

    /**
     * تعديل اسم فرع
     */
    async function editBranch(index) {
        const newName = prompt('اسم الفرع الجديد:', FirebaseModule.branches[index]);
        if (newName && newName.trim() && !FirebaseModule.branches.includes(newName.trim())) {
            const old = FirebaseModule.branches[index];
            FirebaseModule.branches[index] = newName.trim();
            
            // تحديث الطلبات المرتبطة
            for (const o of FirebaseModule.orders) {
                if (o.branch === old) {
                    o.branch = newName.trim();
                    await FirebaseModule.updateOrder(o.id, o);
                }
            }
            
            if (FirebaseModule.currentBranch === old) {
                switchBranch(newName.trim());
            }
            
            await FirebaseModule.saveBranches(FirebaseModule.branches);
            populateBranchSelect();
            renderList();
        } else if (newName && FirebaseModule.branches.includes(newName.trim())) {
            UI.showAlert('الفرع موجود');
        }
    }

    /**
     * حذف فرع
     */
    async function deleteBranch(index) {
        if (FirebaseModule.branches.length <= 1) {
            return UI.showAlert('يجب وجود فرع واحد على الأقل');
        }
        
        const branchToDelete = FirebaseModule.branches[index];
        UI.showConfirm(`حذف فرع "${branchToDelete}" سينقل طلباته إلى "عام". متابعة؟`, async (ok) => {
            if (ok) {
                // تحديث الطلبات
                for (const o of FirebaseModule.orders) {
                    if (o.branch === branchToDelete) {
                        o.branch = 'عام';
                        await FirebaseModule.updateOrder(o.id, o);
                    }
                }
                
                FirebaseModule.branches.splice(index, 1);
                
                if (FirebaseModule.currentBranch === branchToDelete) {
                    switchBranch(FirebaseModule.branches[0]);
                }
                
                await FirebaseModule.saveBranches(FirebaseModule.branches);
                populateBranchSelect();
                renderList();
            }
        });
    }

    /**
     * تبديل الفرع الحالي
     */
    function switchBranch(branch) {
        if (FirebaseModule.currentUser?.role === 'branch_admin') return;
        
        FirebaseModule.currentBranch = branch;
        localStorage.setItem('noor_current_branch', branch);
        document.getElementById('currentBranchName').innerText = 
            branch === 'all' ? 'كل الفروع' : branch;
        
        UI.currentPage = 1;
        UI.renderTable();
        
        const currentTab = document.getElementById('mainTabContent').classList.contains('hidden') ? 'reports' : 'main';
        if (currentTab === 'reports') {
            ReportsModule.renderAllReports();
        }
    }

    /**
     * تحديث قائمة الفروع في المحددات
     */
    function populateBranchSelect() {
        const select = document.getElementById('branchSelect');
        if (!select) return;
        
        let options = '';
        if (FirebaseModule.currentUser?.role === 'super_admin') {
            options += `<option value="all" ${FirebaseModule.currentBranch === 'all' ? 'selected' : ''}>🌐 الكل</option>`;
        }
        options += FirebaseModule.branches.map(b => 
            `<option value="${b}" ${b === FirebaseModule.currentBranch ? 'selected' : ''}>${b}</option>`
        ).join('');
        
        select.innerHTML = options;
        
        const userBranchSelect = document.getElementById('newUserBranch');
        if (userBranchSelect) {
            userBranchSelect.innerHTML = FirebaseModule.branches.map(b => 
                `<option value="${b}">${b}</option>`
            ).join('');
        }
    }

    // الواجهة العامة
    return {
        openModal,
        addBranch,
        editBranch,
        deleteBranch,
        switchBranch,
        populateBranchSelect
    };
})();

window.BranchesModule = BranchesModule;
