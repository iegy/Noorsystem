/**
 * ui.js - واجهة المستخدم (جداول، مودالات، فلاتر، تصفّح، بحث)
 */

const UI = (() => {
    let currentFilter = 'all';
    let currentPage = 1;
    const PAGE_SIZE = window.APP_CONFIG?.PAGE_SIZE || 30;

    function init() {
        buildStatsCards();
        buildOrderForm();
        buildTableSection();
        buildModals();
        buildReportsGrid();
        if (typeof BranchesModule !== 'undefined') {
            BranchesModule.populateBranchSelect();
        }
    }

    function buildStatsCards() {
        const container = document.getElementById('statsCards');
        if (!container) return;
        container.innerHTML = `
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between"><div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">إجمالي الحالات</p><h3 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white" id="statTotal">0</h3></div><div class="w-10 h-10 sm:w-12 sm:h-12 bg-odoo-50 text-odoo-500 rounded-xl flex items-center justify-center"><i class="fa-solid fa-folder-open text-lg sm:text-xl"></i></div></div>
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between"><div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">في المكتب</p><h3 class="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400" id="statMiami">0</h3></div><div class="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-building text-lg sm:text-xl"></i></div></div>
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between"><div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">بالمحل</p><h3 class="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400" id="statShop">0</h3></div><div class="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-circle-check text-lg sm:text-xl"></i></div></div>
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between"><div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">مديونيات</p><h3 class="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400"><span id="statDebt">0</span><span class="text-sm sm:text-base font-normal text-slate-400 dark:text-slate-300"> ج.م</span></h3></div><div class="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-hand-holding-dollar text-lg sm:text-xl"></i></div></div>
        `;
    }

    function buildOrderForm() {
        const container = document.getElementById('orderFormSection');
        if (!container) return;
        const orderTypes = window.APP_CONFIG?.ORDER_TYPES || ['نظارة وعدسات جديدة', 'عدسات فقط', 'صيانة فقط'];
        const orderStatuses = window.APP_CONFIG?.ORDER_STATUSES || ['في المكتب', 'بالمحل'];
        const deliveryStatuses = window.APP_CONFIG?.DELIVERY_STATUSES || ['لم يتم', 'تم التسليم'];
        container.innerHTML = `
            <div class="odoo-card rounded-xl overflow-hidden">
                <div class="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none" onclick="UI.toggleOrderForm()" id="formToggleHeader">
                    <div class="flex items-center gap-2 sm:gap-3"><i class="fa-solid fa-circle-plus text-odoo-500 text-lg sm:text-xl"></i><h2 class="text-base sm:text-lg font-bold text-slate-800 dark:text-white">تسجيل معاملة جديدة <span class="text-xs sm:text-sm font-normal text-slate-400">(جميع الحقول اختيارية)</span></h2></div>
                    <i id="formToggleIcon" class="fa-solid fa-chevron-down text-slate-400 transition-transform text-lg"></i>
                </div>
                <div id="formCollapsible" class="collapsible-content">
                    <div class="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-600">
                        <form id="orderForm" class="space-y-4 sm:space-y-5">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">تاريخ الإرسال</label><input type="date" id="orderDate" class="w-full odoo-input"></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">اسم العميل</label><input type="text" id="custName" class="w-full odoo-input" placeholder="محمد أحمد..."></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">رقم التليفون</label><input type="tel" id="custPhone" class="w-full odoo-input text-right" placeholder="012xxxxxxx"></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">رقم SO</label><input type="text" id="orderSoNumber" class="w-full odoo-input" placeholder="مثال: SO-00125"></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">تصنيف العمل</label><select id="orderType" class="w-full odoo-input">${orderTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">التواجد</label><select id="orderStatus" class="w-full odoo-input">${orderStatuses.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">تسليم العميل</label><select id="deliveryStatus" class="w-full odoo-input">${deliveryStatuses.map(d => `<option value="${d}">${d === 'لم يتم' ? 'لم يتم ❌' : 'تم التسليم ✅'}</option>`).join('')}</select></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">ملاحظات</label><textarea id="orderNotes" rows="2" class="w-full odoo-input" placeholder="ملاحظات..."></textarea></div>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-700/50 p-4 sm:p-5 rounded-xl space-y-3 sm:space-y-4">
                                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">الإجمالي</label><input type="number" id="totalPrice" min="0" class="w-full odoo-input" oninput="OrdersModule.calcRemaining()" placeholder="0.00"></div>
                                    <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">المدفوع</label><input type="number" id="paidAmount" min="0" class="w-full odoo-input" oninput="OrdersModule.calcRemaining()" placeholder="0.00"></div>
                                </div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">المتبقي</label><input type="number" id="remainingAmount" class="w-full bg-white dark:bg-gray-500 border border-slate-200 dark:border-gray-600 rounded-lg py-2 px-3 text-base font-bold" readonly value="0"></div>
                            </div>
                            <button type="submit" class="w-full odoo-btn-primary py-2 sm:py-3 text-base sm:text-lg flex items-center justify-center gap-2"><i class="fa-solid fa-square-check"></i> حفظ وإدراج</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    function buildTableSection() {
        const container = document.getElementById('tableSection');
        if (!container) return;
        container.innerHTML = `
            <div class="odoo-card rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 no-print flex-wrap">
                <div class="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button onclick="UI.filterTable('all')" id="btnFilterAll" class="filter-btn px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-bold bg-white dark:bg-slate-500 text-odoo-700 dark:text-white shadow-sm">الكل</button>
                    <button onclick="UI.filterTable('office')" id="btnFilterOffice" class="filter-btn px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">في المكتب</button>
                    <button onclick="UI.filterTable('shop')" id="btnFilterShop" class="filter-btn px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">بالمحل</button>
                    <button onclick="UI.filterTable('ready')" id="btnFilterReady" class="filter-btn px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium text-emerald-600 dark:text-emerald-400">⏳ جاهز للتسليم</button>
                    <button onclick="UI.filterTable('debt')" id="btnFilterDebt" class="filter-btn px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium text-rose-600 dark:text-rose-400">باقي مالي</button>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <button onclick="UI.openColumnSettings()" class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"><i class="fa-solid fa-gear"></i></button>
                    <button onclick="ReportsModule.exportExcel()" class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border font-bold px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"><i class="fa-regular fa-file-excel"></i> <span class="hidden sm:inline">إكسل</span></button>
                    <button onclick="window.print()" class="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border font-bold px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"><i class="fa-solid fa-file-pdf"></i> <span class="hidden sm:inline">PDF</span></button>
                    <button onclick="ReportsModule.exportJSON()" class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border font-bold px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"><i class="fa-solid fa-download"></i> <span class="hidden sm:inline">JSON</span></button>
                    <label id="importJSONLabel" class="bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 border font-bold px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base flex items-center gap-1 cursor-pointer"><i class="fa-solid fa-upload"></i> <span class="hidden sm:inline">استيراد</span><input type="file" id="importJSONFile" accept=".json" class="hidden" onchange="ReportsModule.importJSON(event)"></label>
                </div>
            </div>
            <div class="relative mb-4 sm:mb-5 no-print">
                <span class="absolute right-3 sm:right-4 top-3 sm:top-4 text-slate-400"><i class="fa-solid fa-magnifying-glass text-lg sm:text-xl"></i></span>
                <input type="text" id="searchBar" oninput="UI.searchOrders()" class="w-full odoo-input py-2 sm:py-3 pr-10 sm:pr-12 pl-3 sm:pl-4 text-base sm:text-lg" placeholder="ابحث عن اسم العميل أو رقم التليفون...">
            </div>
            <div class="odoo-card rounded-xl overflow-hidden">
                <div class="table-responsive">
                    <table class="w-full text-right border-collapse" id="mainOrdersTable">
                        <thead><tr class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm sm:text-base font-bold"></tr></thead>
                        <tbody id="tableBody" class="text-sm sm:text-base divide-y divide-slate-100 dark:divide-slate-600"></tbody>
                    </table>
                </div>
                <div id="paginationControls" class="flex justify-between items-center px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-600 no-print hidden">
                    <button id="prevPageBtn" onclick="UI.goToPage(UI.currentPage - 1)" class="pagination-btn flex items-center gap-1 text-sm sm:text-base"><i class="fa-solid fa-chevron-right"></i> السابق</button>
                    <span class="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200" id="pageInfo"></span>
                    <button id="nextPageBtn" onclick="UI.goToPage(UI.currentPage + 1)" class="pagination-btn flex items-center gap-1 text-sm sm:text-base">التالي <i class="fa-solid fa-chevron-left"></i></button>
                </div>
                <div id="noDataView" class="hidden p-8 sm:p-12 text-center no-print"><div class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3"><i class="fa-solid fa-inbox"></i></div><p class="text-slate-400 dark:text-slate-300 text-sm sm:text-base font-medium">لا توجد طلبات تطابق الفلتر الحالي.</p></div>
            </div>
        `;
    }

    function buildModals() {
    const container = document.getElementById('modalsContainer');
    if (!container) return;
    
    const orderTypes = window.APP_CONFIG?.ORDER_TYPES || ['نظارة وعدسات جديدة', 'عدسات فقط', 'صيانة فقط'];
    const orderStatuses = window.APP_CONFIG?.ORDER_STATUSES || ['في المكتب', 'بالمحل'];
    const deliveryStatuses = window.APP_CONFIG?.DELIVERY_STATUSES || ['لم يتم', 'تم التسليم'];
    
    container.innerHTML = `
        <!-- مودال كلمة المرور -->
        <div id="passwordModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('passwordModal')">
            <div class="modal-content">
                <div class="modal-header">
                    <div style="display:flex;align-items:center;">
                        <div class="modal-header-icon"><i class="fa-solid fa-lock"></i></div>
                        <span class="modal-header-title">تغيير كلمة المرور</span>
                    </div>
                    <button onclick="UI.closeModal('passwordModal')" class="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    <form id="passwordForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">كلمة المرور الحالية</label>
                            <input type="password" id="currentPassword" class="w-full odoo-input" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">كلمة المرور الجديدة</label>
                            <input type="password" id="newPassword" class="w-full odoo-input" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">تأكيد كلمة المرور</label>
                            <input type="password" id="confirmNewPassword" class="w-full odoo-input" required>
                        </div>
                        <button type="submit" class="w-full modal-btn modal-btn-primary py-2.5 text-base">حفظ كلمة المرور الجديدة</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- مودال التعديل -->
        <div id="editModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('editModal')">
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <div style="display:flex;align-items:center;">
                        <div class="modal-header-icon"><i class="fa-solid fa-pen-to-square"></i></div>
                        <span class="modal-header-title">تعديل الطلب</span>
                    </div>
                    <button onclick="UI.closeModal('editModal')" class="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    <form id="editForm" class="space-y-4">
                        <input type="hidden" id="editId">
                        <div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">تاريخ الإرسال</label><input type="date" id="editDate" class="w-full odoo-input"></div>
                        <div class="grid grid-cols-2 gap-3"><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">الاسم</label><input type="text" id="editName" class="w-full odoo-input"></div><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">الهاتف</label><input type="text" id="editPhone" class="w-full odoo-input"></div></div>
                        <div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">رقم SO</label><input type="text" id="editSoNumber" class="w-full odoo-input"></div>
                        <div class="grid grid-cols-3 gap-3"><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">الإجمالي</label><input type="number" id="editTotal" class="w-full odoo-input" oninput="OrdersModule.updateEditRemaining()"></div><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">المدفوع</label><input type="number" id="editPaid" class="w-full odoo-input" oninput="OrdersModule.updateEditRemaining()"></div><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">المتبقي</label><input type="number" id="editRemaining" class="w-full bg-slate-100 dark:bg-slate-600 rounded-lg py-2 px-3 font-bold" readonly></div></div>
                        <div class="grid grid-cols-2 gap-3"><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">النوع</label><select id="editType" class="w-full odoo-input">${orderTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">التواجد</label><select id="editStatus" class="w-full odoo-input">${orderStatuses.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div></div>
                        <div class="grid grid-cols-2 gap-3"><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">التسليم</label><select id="editDelivery" class="w-full odoo-input">${deliveryStatuses.map(d => `<option value="${d}">${d}</option>`).join('')}</select></div><div><label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1 optional-label">ملاحظات</label><input type="text" id="editNotes" class="w-full odoo-input"></div></div>
                        <button type="submit" class="w-full modal-btn modal-btn-primary py-2.5 text-base"><i class="fa-solid fa-floppy-disk ml-2"></i> حفظ التعديلات</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- مودال الفروع -->
        <div id="branchesModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('branchesModal')">
            <div class="modal-content">
                <div class="modal-header">
                    <div style="display:flex;align-items:center;">
                        <div class="modal-header-icon"><i class="fa-solid fa-code-branch"></i></div>
                        <span class="modal-header-title">إدارة الفروع</span>
                    </div>
                    <button onclick="UI.closeModal('branchesModal')" class="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    <div class="space-y-3 mb-4 max-h-60 overflow-y-auto" id="branchesList"></div>
                    <div class="flex gap-2"><input type="text" id="newBranchName" class="flex-1 odoo-input" placeholder="اسم الفرع الجديد"><button onclick="BranchesModule.addBranch()" class="modal-btn modal-btn-primary"><i class="fa-solid fa-plus ml-1"></i> إضافة</button></div>
                </div>
            </div>
        </div>

        <!-- مودال إعدادات الأعمدة -->
        <div id="columnSettingsModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('columnSettingsModal')">
            <div class="modal-content">
                <div class="modal-header">
                    <div style="display:flex;align-items:center;">
                        <div class="modal-header-icon"><i class="fa-solid fa-table-columns"></i></div>
                        <span class="modal-header-title">تخصيص الأعمدة</span>
                    </div>
                    <button onclick="UI.closeModal('columnSettingsModal')" class="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    <div class="space-y-3 max-h-80 overflow-y-auto" id="columnsCheckboxes"></div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-3" id="columnCountIndicator"></div>
                    <button onclick="UI.saveColumnSettings()" class="mt-4 w-full modal-btn modal-btn-primary py-2.5 text-base">حفظ الإعدادات</button>
                </div>
            </div>
        </div>

        <!-- مودال المستخدمين -->
        <div id="usersModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('usersModal')">
            <div class="modal-content" style="max-width:650px;">
                <div class="modal-header">
                    <div style="display:flex;align-items:center;">
                        <div class="modal-header-icon"><i class="fa-solid fa-users-gear"></i></div>
                        <span class="modal-header-title">إدارة المستخدمين</span>
                    </div>
                    <button onclick="UI.closeModal('usersModal')" class="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    <div class="space-y-3 mb-4 max-h-60 overflow-y-auto" id="usersList"></div>
                    <div class="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4">
                        <h4 class="font-bold text-slate-700 dark:text-slate-200 mb-3">إضافة مستخدم جديد</h4>
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" id="newUsername" class="odoo-input" placeholder="اسم المستخدم">
                            <input type="password" id="newUserPassword" class="odoo-input" placeholder="كلمة المرور (6 خانات)">
                            <input type="text" id="newUserDisplayName" class="odoo-input" placeholder="الاسم الظاهر">
                            <select id="newUserRole" class="odoo-input"><option value="super_admin">مدير عام</option><option value="branch_admin" selected>مدير فرع</option><option value="user">موظف</option></select>
                            <select id="newUserBranch" class="odoo-input"></select>
                        </div>
                        <button onclick="UsersModule.addNewUser()" class="w-full modal-btn modal-btn-primary py-2 text-base"><i class="fa-solid fa-user-plus ml-1"></i> إضافة</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- مودال التأكيد -->
        <div id="confirmModal" class="modal-overlay confirm-modal">
            <div class="modal-content" style="max-width:420px;">
                <div class="modal-body">
                    <div class="confirm-icon warning"><i class="fa-solid fa-circle-question"></i></div>
                    <h3 class="confirm-title" id="confirmMessage"></h3>
                    <div class="flex justify-center gap-3">
                        <button onclick="UI.confirmAction(false)" class="modal-btn modal-btn-secondary flex-1">إلغاء</button>
                        <button onclick="UI.confirmAction(true)" class="modal-btn modal-btn-danger flex-1">تأكيد</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- مودال التنبيه -->
        <div id="alertModal" class="modal-overlay confirm-modal">
            <div class="modal-content" style="max-width:400px;">
                <div class="modal-body">
                    <div class="confirm-icon info"><i class="fa-solid fa-circle-info"></i></div>
                    <h3 class="confirm-title" id="alertMessage"></h3>
                    <button onclick="UI.closeAlert()" class="modal-btn modal-btn-primary w-full mt-2">حسنًا</button>
                </div>
            </div>
        </div>
    `;
}

    function buildReportsGrid() {
        const container = document.getElementById('reportsGrid');
        if (!container) return;
        const reports = [
            { id: 'Office', icon: 'fa-building', color: 'amber', title: 'الموجود في المكتب' },
            { id: 'Received', icon: 'fa-check-circle', color: 'emerald', title: 'المستلم في المحل' },
            { id: 'Customers', icon: 'fa-users', color: 'sky', title: 'كشف العملاء' },
            { id: 'Delayed', icon: 'fa-clock', color: 'rose', title: 'المتأخرات' },
            { id: 'Financial', icon: 'fa-money-bill-wave', color: 'green', title: 'تقرير مالي' },
            { id: 'Daily', icon: 'fa-calendar-day', color: 'purple', title: 'تقرير يومي' }
        ];
        container.innerHTML = reports.map(r => `
            <div class="odoo-card p-4 sm:p-6 rounded-xl"><div class="flex justify-between items-start mb-3 sm:mb-4"><h3 class="font-bold text-slate-700 dark:text-slate-200 text-base sm:text-lg"><i class="fa-solid ${r.icon} text-${r.color}-500 ml-2"></i> ${r.title}</h3><button onclick="ReportsModule.printReport('${r.id.toLowerCase()}')" class="text-xs sm:text-sm bg-${r.color}-50 dark:bg-${r.color}-900/30 text-${r.color}-700 dark:text-${r.color}-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold"><i class="fa-solid fa-print ml-1"></i> طباعة</button></div><div id="report${r.id}" class="max-h-52 overflow-y-auto text-sm sm:text-base space-y-2"></div></div>
        `).join('');
    }

    function renderTable() {
        const allColumns = window.APP_CONFIG?.ALL_COLUMNS || [];
        const visibleCols = allColumns.filter(c => c.visible);
        const user = FirebaseModule.currentUser;
        const isAdmin = (user?.role === 'super_admin' || user?.role === 'branch_admin');
        const theadRow = document.querySelector('#mainOrdersTable thead tr');
        if (!theadRow) return;
        let headerHtml = '';
        const names = { date:'التاريخ', soNumber:'رقم SO', name:'العميل', phone:'الهاتف', type:'النوع', total:'الإجمالي', paid:'المدفوع', remaining:'المتبقي', status:'التواجد', delivery:'التسليم', notes:'ملاحظات', days:'الأيام' };
        visibleCols.forEach(col => { headerHtml += `<th class="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-600${['total','paid','remaining','status','delivery','days'].includes(col.id)?' text-center':''}">${names[col.id]}</th>`; });
        headerHtml += '<th class="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-600 text-center no-print">واتساب</th>';
        if (isAdmin) headerHtml += '<th class="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-600 text-center no-print">إجراءات</th>';
        theadRow.innerHTML = headerHtml;
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const filtered = getFilteredOrders();
        const totalCount = filtered.length;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        if (currentPage > totalPages) currentPage = totalPages || 1;
        const start = (currentPage - 1) * PAGE_SIZE;
        const displayOrders = filtered.slice(start, start + PAGE_SIZE);
        let officeCount = 0, shopCount = 0, debtSum = 0;
        filtered.forEach(o => { if (o.status === 'في المكتب') officeCount++; else if (o.status === 'بالمحل') shopCount++; if (o.remaining > 0) debtSum += o.remaining; });
        document.getElementById('noDataView')?.classList.toggle('hidden', totalCount > 0);
        displayOrders.forEach(o => {
            let tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200 text-sm sm:text-base";
            const days = getDaysSince(o.date);
            if (o.status === 'في المكتب' && days >= 30) tr.classList.add('delayed-danger');
            else if (o.status === 'في المكتب' && days >= 14) tr.classList.add('delayed-danger');
            else if (o.status === 'في المكتب' && days >= 7) tr.classList.add('delayed-warning');
            let rowHtml = '';
            visibleCols.forEach(col => {
                switch(col.id) {
                    case 'date': rowHtml += `<td class="p-3 sm:p-4 whitespace-nowrap">${o.date}</td>`; break;
                    case 'soNumber': rowHtml += `<td class="p-3 sm:p-4 font-mono font-bold text-odoo-600 dark:text-odoo-400">${o.soNumber||'—'}</td>`; break;
                    case 'name': rowHtml += `<td class="p-3 sm:p-4 font-semibold">${o.name}</td>`; break;
                    case 'phone': rowHtml += `<td class="p-3 sm:p-4 whitespace-nowrap">${o.phone}</td>`; break;
                    case 'type': rowHtml += `<td class="p-3 sm:p-4"><span class="type-badge ${getTypeBadgeClass(o.type)}">${o.type}</span></td>`; break;
                    case 'total': rowHtml += `<td class="p-3 sm:p-4 text-center font-bold">${o.total}</td>`; break;
                    case 'paid': rowHtml += `<td class="p-3 sm:p-4 text-center text-emerald-600 dark:text-emerald-400">${o.paid}</td>`; break;
                    case 'remaining': rowHtml += `<td class="p-3 sm:p-4 text-center ${o.remaining>0?'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/20':'text-slate-400 dark:text-slate-500'}">${o.remaining}</td>`; break;
                    case 'status': const badge = o.status==='في المكتب'?'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300':'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'; rowHtml += `<td class="p-3 sm:p-4 text-center"><span class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${badge}"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${o.status==='في المكتب'?'bg-amber-500':'bg-emerald-500'}"></span>${o.status}</span></td>`; break;
                    case 'delivery': const d = o.delivery==='تم التسليم'?'<span class="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"><i class="fa-solid fa-check"></i> تم</span>':'<span class="text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"><i class="fa-solid fa-clock"></i> لم يتم</span>'; rowHtml += `<td class="p-3 sm:p-4 text-center ${isAdmin?'cursor-pointer':''}" ${isAdmin?`onclick="OrdersModule.toggleDelivery('${o.id}')"`:''}>${d}</td>`; break;
                    case 'notes': rowHtml += `<td class="p-3 sm:p-4 max-w-[100px] sm:max-w-[140px] truncate text-slate-500 dark:text-slate-400" title="${o.notes||''}">${o.notes||'—'}</td>`; break;
                    case 'days': let daysHtml = days; if (days >= 30) daysHtml = `<span class="text-red-600 font-bold">${days}</span>`; else if (days >= 14) daysHtml = `<span class="text-red-500 font-bold">${days}</span>`; else if (days >= 7) daysHtml = `<span class="text-amber-600 font-bold">${days}</span>`; rowHtml += `<td class="p-3 sm:p-4 text-center">${daysHtml}</td>`; break;
                }
            });
            rowHtml += `<td class="p-3 sm:p-4 text-center no-print"><button onclick="sendWhatsApp('${o.phone}', '${(o.name||'').replace(/'/g, "\\'")}')" class="whatsapp-btn p-1.5 sm:p-2 rounded-lg"><i class="fa-brands fa-whatsapp text-xl sm:text-2xl"></i></button></td>`;
            if (isAdmin) { rowHtml += `<td class="p-3 sm:p-4 text-center no-print"><div class="flex justify-center gap-1"><button onclick="OrdersModule.openEditModal('${o.id}')" class="text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 p-1.5 sm:p-2 rounded-lg"><i class="fa-solid fa-pen-to-square text-base sm:text-lg"></i></button><button onclick="OrdersModule.toggleStatus('${o.id}')" class="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1.5 sm:p-2 rounded-lg"><i class="fa-solid fa-right-left text-base sm:text-lg"></i></button><button onclick="OrdersModule.deleteOrder('${o.id}')" class="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 sm:p-2 rounded-lg"><i class="fa-regular fa-trash-can text-base sm:text-lg"></i></button></div></td>`; }
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
        updateStats(totalCount, officeCount, shopCount, debtSum);
        updateSmartAlerts(filtered);
        updatePagination(totalPages);
        const reportsTab = document.getElementById('reportsTabContent');
        if (reportsTab && !reportsTab.classList.contains('hidden') && typeof ReportsModule !== 'undefined') { ReportsModule.renderAllReports(); }
    }

    function updateStats(total, office, shop, debt) {
        const statTotal = document.getElementById('statTotal');
        const statMiami = document.getElementById('statMiami');
        const statShop = document.getElementById('statShop');
        const statDebt = document.getElementById('statDebt');
        if (statTotal) statTotal.innerText = total;
        if (statMiami) statMiami.innerText = office;
        if (statShop) statShop.innerText = shop;
        if (statDebt) statDebt.innerText = debt.toLocaleString('ar-EG');
    }

    function updateSmartAlerts(branchOrders) {
        const container = document.getElementById('smartAlerts');
        if (!container) return;
        let c7=0, c14=0, c30=0;
        branchOrders.filter(o => o.status === 'في المكتب').forEach(o => { const d = getDaysSince(o.date); if (d >= 30) c30++; else if (d >= 14) c14++; else if (d >= 7) c7++; });
        let html = '';
        if (c30>0) html += `<div class="odoo-card p-3 sm:p-4 rounded-xl mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 text-red-700 dark:text-red-400"><i class="fa-solid fa-circle-exclamation text-xl sm:text-2xl"></i> <span class="font-bold text-base sm:text-lg">${c30} طلبات متأخرة جداً (30 يوم)</span></div>`;
        if (c14>0) html += `<div class="odoo-card p-3 sm:p-4 rounded-xl mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 text-red-600 dark:text-red-400"><i class="fa-solid fa-triangle-exclamation text-xl sm:text-2xl"></i> <span class="font-bold text-base sm:text-lg">${c14} طلبات متأخرة (14 يوم)</span></div>`;
        if (c7>0) html += `<div class="odoo-card p-3 sm:p-4 rounded-xl mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 text-amber-600 dark:text-amber-400"><i class="fa-solid fa-exclamation-triangle text-xl sm:text-2xl"></i> <span class="font-bold text-base sm:text-lg">${c7} طلبات متأخرة (7 أيام)</span></div>`;
        container.innerHTML = html;
    }

    function updatePagination(totalPages) {
        const paginationDiv = document.getElementById('paginationControls');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageInfo = document.getElementById('pageInfo');
        if (!paginationDiv) return;
        if (totalPages > 1) { paginationDiv.classList.remove('hidden'); if (prevBtn) prevBtn.disabled = currentPage <= 1; if (nextBtn) nextBtn.disabled = currentPage >= totalPages; if (pageInfo) pageInfo.innerText = `صفحة ${currentPage} من ${totalPages}`; }
        else { paginationDiv.classList.add('hidden'); }
    }

    function getFilteredOrders() {
        const user = FirebaseModule.currentUser;
        const currentBranch = FirebaseModule.currentBranch;
        let branchOrders;
        if (user?.role === 'super_admin') { if (currentBranch === 'all') branchOrders = [...FirebaseModule.orders]; else branchOrders = FirebaseModule.orders.filter(o => (o.branch || 'رشيد') === currentBranch); }
        else if (user?.role === 'branch_admin') { branchOrders = FirebaseModule.orders.filter(o => (o.branch || 'رشيد') === user.branch); }
        else { branchOrders = FirebaseModule.orders.filter(o => (o.branch || 'رشيد') === currentBranch); }
        const searchEl = document.getElementById('searchBar');
        const search = searchEl ? searchEl.value.toLowerCase() : '';
        return branchOrders.filter(o => {
            if (currentFilter === 'office' && o.status !== 'في المكتب') return false;
            if (currentFilter === 'shop' && o.status !== 'بالمحل') return false;
            if (currentFilter === 'ready' && (o.status !== 'بالمحل' || o.delivery === 'تم التسليم')) return false;
            if (currentFilter === 'debt' && o.remaining <= 0) return false;
            if (search) { return [o.name, o.phone, o.soNumber||'', o.notes||''].join(' ').toLowerCase().includes(search); }
            return true;
        });
    }

    function filterTable(type) { 
        currentFilter = type; 
        document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('bg-white','dark:bg-slate-500','text-odoo-700','dark:text-white','shadow-sm','font-bold'); b.classList.add('text-slate-600','dark:text-slate-300','font-medium'); }); 
        const activeMap = { office:'btnFilterOffice', shop:'btnFilterShop', debt:'btnFilterDebt', ready:'btnFilterReady', all:'btnFilterAll' };
        const active = document.getElementById(activeMap[type] || 'btnFilterAll'); 
        if (active) { active.classList.add('bg-white','dark:bg-slate-500','text-odoo-700','dark:text-white','shadow-sm','font-bold'); active.classList.remove('text-slate-600','dark:text-slate-300','font-medium'); } 
        currentPage = 1; 
        renderTable(); 
    }

    function searchOrders() { currentPage = 1; renderTable(); }
    function goToPage(page) { const totalPages = Math.ceil(getFilteredOrders().length / PAGE_SIZE); currentPage = Math.max(1, Math.min(page, totalPages)); renderTable(); }

    function openColumnSettings() {
        const container = document.getElementById('columnsCheckboxes');
        if (!container) return;
        const allColumns = window.APP_CONFIG?.ALL_COLUMNS || [];
        container.innerHTML = allColumns.map(col => `<label class="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"><input type="checkbox" ${col.visible ? 'checked' : ''} data-column-id="${col.id}" class="column-checkbox w-5 h-5 text-odoo-500 rounded"><span class="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">${col.name}</span></label>`).join('');
        updateColumnCount();
        document.getElementById('columnSettingsModal')?.classList.add('active');
    }

    function updateColumnCount() {
        const checked = document.querySelectorAll('.column-checkbox:checked').length;
        const allColumns = window.APP_CONFIG?.ALL_COLUMNS || [];
        const indicator = document.getElementById('columnCountIndicator');
        if (indicator) indicator.innerText = `${checked} أعمدة مُفعّلة من أصل ${allColumns.length}`;
    }

    async function saveColumnSettings() {
        const allColumns = window.APP_CONFIG?.ALL_COLUMNS || [];
        document.querySelectorAll('.column-checkbox').forEach(cb => { const col = allColumns.find(c => c.id === cb.dataset.columnId); if (col) col.visible = cb.checked; });
        const user = FirebaseModule.currentUser;
        if (user) { const columnsData = allColumns.map(c => ({id: c.id, visible: c.visible})); await FirebaseModule.saveColumnSettings(user.username, columnsData); }
        closeModal('columnSettingsModal');
        renderTable();
    }

    function closeModal(modalId) { const modal = document.getElementById(modalId); if (modal) modal.classList.remove('active'); }

    let confirmCallback = null;
    function showConfirm(message, cb) { const el = document.getElementById('confirmMessage'); const modal = document.getElementById('confirmModal'); if (el) el.innerText = message; if (modal) modal.classList.add('active'); confirmCallback = cb; }
    function confirmAction(result) { const modal = document.getElementById('confirmModal'); if (modal) modal.classList.remove('active'); if (confirmCallback) confirmCallback(result); confirmCallback = null; }
    function showAlert(message) { const el = document.getElementById('alertMessage'); const modal = document.getElementById('alertModal'); if (el) el.innerText = message; if (modal) modal.classList.add('active'); }
    function closeAlert() { const modal = document.getElementById('alertModal'); if (modal) modal.classList.remove('active'); }

    function toggleDarkMode() { 
        const isDark = !document.documentElement.classList.contains('dark');
        if (isDark) { document.documentElement.classList.add('dark'); const icon = document.getElementById('darkModeIcon'); if (icon) icon.className = 'fa-solid fa-sun'; }
        else { document.documentElement.classList.remove('dark'); const icon = document.getElementById('darkModeIcon'); if (icon) icon.className = 'fa-solid fa-moon'; }
        localStorage.setItem('noor_dark_mode', isDark); 
    }

    function toggleOrderForm() { 
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return; 
        const c = document.getElementById('formCollapsible');
        const i = document.getElementById('formToggleIcon');
        if (c) c.classList.toggle('open'); 
        if (i) { i.classList.toggle('fa-chevron-up'); i.classList.toggle('fa-chevron-down'); }
    }

    function getTypeBadgeClass(type) { if (type === 'نظارة وعدسات جديدة') return 'type-new-glasses'; if (type === 'عدسات فقط') return 'type-lenses-only'; return 'type-maintenance'; }
    function getDaysSince(dateStr) { if (!dateStr) return 0; const parts = dateStr.split('/'); if (parts.length !== 3) return 0; const d = new Date(parts[2], parts[1] - 1, parts[0]); const now = new Date(); now.setHours(0,0,0,0); return Math.floor((now - d) / (1000 * 60 * 60 * 24)); }

    return {
        init, renderTable, filterTable, searchOrders, goToPage, openColumnSettings, saveColumnSettings, updateColumnCount,
        closeModal, showConfirm, confirmAction, showAlert, closeAlert, toggleDarkMode, toggleOrderForm,
        get currentPage() { return currentPage; },
        set currentPage(val) { currentPage = val; }
    };
})();

window.UI = UI;
