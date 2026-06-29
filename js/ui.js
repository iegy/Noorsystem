/**
 * ui.js - واجهة المستخدم (جداول، مودالات، فلاتر، تصفّح)
 */

const UI = (() => {
    let currentFilter = 'all';
    let currentPage = 1;
    const PAGE_SIZE = window.APP_CONFIG.PAGE_SIZE;

    /**
     * تهيئة واجهة المستخدم
     */
    function init() {
        buildStatsCards();
        buildOrderForm();
        buildTableSection();
        buildModals();
        buildReportsGrid();
        populateBranchSelect();
        switchTab('main');
    }

    /**
     * بناء كروت الإحصائيات
     */
    function buildStatsCards() {
        const container = document.getElementById('statsCards');
        if (!container) return;
        
        container.innerHTML = `
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between">
                <div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">إجمالي الحالات</p>
                <h3 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white" id="statTotal">0</h3></div>
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-odoo-50 text-odoo-500 rounded-xl flex items-center justify-center"><i class="fa-solid fa-folder-open text-lg sm:text-xl"></i></div>
            </div>
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between">
                <div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">في المكتب</p>
                <h3 class="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400" id="statMiami">0</h3></div>
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-building text-lg sm:text-xl"></i></div>
            </div>
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between">
                <div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">بالمحل</p>
                <h3 class="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400" id="statShop">0</h3></div>
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-circle-check text-lg sm:text-xl"></i></div>
            </div>
            <div class="odoo-card p-4 sm:p-5 rounded-xl flex items-center justify-between">
                <div><p class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-300">مديونيات</p>
                <h3 class="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400"><span id="statDebt">0</span><span class="text-sm sm:text-base font-normal text-slate-400 dark:text-slate-300"> ج.م</span></h3></div>
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-hand-holding-dollar text-lg sm:text-xl"></i></div>
            </div>
        `;
    }

    /**
     * بناء نموذج الطلب
     */
    function buildOrderForm() {
        const container = document.getElementById('orderFormSection');
        if (!container) return;
        
        container.innerHTML = `
            <div class="odoo-card rounded-xl overflow-hidden">
                <div class="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none" onclick="UI.toggleOrderForm()" id="formToggleHeader">
                    <div class="flex items-center gap-2 sm:gap-3">
                        <i class="fa-solid fa-circle-plus text-odoo-500 text-lg sm:text-xl"></i>
                        <h2 class="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                            تسجيل معاملة جديدة 
                            <span class="text-xs sm:text-sm font-normal text-slate-400">(جميع الحقول اختيارية)</span>
                        </h2>
                    </div>
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
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">تصنيف العمل</label><select id="orderType" class="w-full odoo-input">${ORDER_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">التواجد</label><select id="orderStatus" class="w-full odoo-input">${ORDER_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>
                                <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">تسليم العميل</label><select id="deliveryStatus" class="w-full odoo-input">${DELIVERY_STATUSES.map(d => `<option value="${d}">${d === 'لم يتم' ? 'لم يتم ❌' : 'تم التسليم ✅'}</option>`).join('')}</select></div>
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

    /**
     * بناء قسم الجدول
     */
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
                    <button id="prevPageBtn" class="pagination-btn flex items-center gap-1 text-sm sm:text-base"><i class="fa-solid fa-chevron-right"></i> السابق</button>
                    <span class="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200" id="pageInfo"></span>
                    <button id="nextPageBtn" class="pagination-btn flex items-center gap-1 text-sm sm:text-base">التالي <i class="fa-solid fa-chevron-left"></i></button>
                </div>
                <div id="noDataView" class="hidden p-8 sm:p-12 text-center no-print">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3"><i class="fa-solid fa-inbox"></i></div>
                    <p class="text-slate-400 dark:text-slate-300 text-sm sm:text-base font-medium">لا توجد طلبات تطابق الفلتر الحالي.</p>
                </div>
            </div>
        `;
    }

    /**
     * بناء المودالات
     */
    function buildModals() {
        const container = document.getElementById('modalsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <!-- مودال كلمة المرور -->
            <div id="passwordModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('passwordModal')">
                <div class="modal-content">
                    <div class="flex justify-between items-center mb-5"><h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">تغيير كلمة المرور</h3><button onclick="UI.closeModal('passwordModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i class="fa-solid fa-xmark text-xl sm:text-2xl"></i></button></div>
                    <form id="passwordForm" class="space-y-4 sm:space-y-5">
                        <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">كلمة المرور الحالية</label><input type="password" id="currentPassword" class="w-full odoo-input" required></div>
                        <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">كلمة المرور الجديدة</label><input type="password" id="newPassword" class="w-full odoo-input" required></div>
                        <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">تأكيد كلمة المرور الجديدة</label><input type="password" id="confirmNewPassword" class="w-full odoo-input" required></div>
                        <button type="submit" class="w-full odoo-btn-primary py-2 sm:py-3 text-base sm:text-lg">حفظ كلمة المرور الجديدة</button>
                    </form>
                </div>
            </div>

            <!-- مودال التعديل -->
            <div id="editModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('editModal')">
                <div class="modal-content">
                    <div class="flex justify-between items-center mb-4 sm:mb-5"><h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">تعديل الطلب</h3><button onclick="UI.closeModal('editModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i class="fa-solid fa-xmark text-xl sm:text-2xl"></i></button></div>
                    <form id="editForm" class="space-y-4 sm:space-y-5">
                        <input type="hidden" id="editId">
                        <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">تاريخ الإرسال</label><input type="date" id="editDate" class="w-full odoo-input"></div>
                        <div class="grid grid-cols-2 gap-3 sm:gap-4"><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">الاسم</label><input type="text" id="editName" class="w-full odoo-input"></div><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">الهاتف</label><input type="text" id="editPhone" class="w-full odoo-input"></div></div>
                        <div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">رقم SO</label><input type="text" id="editSoNumber" class="w-full odoo-input"></div>
                        <div class="grid grid-cols-3 gap-3 sm:gap-4"><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">الإجمالي</label><input type="number" id="editTotal" class="w-full odoo-input" oninput="OrdersModule.updateEditRemaining()"></div><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">المدفوع</label><input type="number" id="editPaid" class="w-full odoo-input" oninput="OrdersModule.updateEditRemaining()"></div><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">المتبقي</label><input type="number" id="editRemaining" class="w-full bg-slate-100 dark:bg-slate-600 rounded-lg py-2 px-3 text-base font-bold" readonly></div></div>
                        <div class="grid grid-cols-2 gap-3 sm:gap-4"><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">النوع</label><select id="editType" class="w-full odoo-input">${ORDER_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">التواجد</label><select id="editStatus" class="w-full odoo-input">${ORDER_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div></div>
                        <div class="grid grid-cols-2 gap-3 sm:gap-4"><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">التسليم</label><select id="editDelivery" class="w-full odoo-input">${DELIVERY_STATUSES.map(d => `<option value="${d}">${d}</option>`).join('')}</select></div><div><label class="block text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mb-1 sm:mb-2 optional-label">ملاحظات</label><input type="text" id="editNotes" class="w-full odoo-input"></div></div>
                        <button type="submit" class="w-full odoo-btn-primary py-2 sm:py-3 text-base sm:text-lg"><i class="fa-solid fa-floppy-disk ml-2"></i> حفظ التعديلات</button>
                    </form>
                </div>
            </div>

            <!-- مودال الفروع -->
            <div id="branchesModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('branchesModal')">
                <div class="modal-content">
                    <div class="flex justify-between items-center mb-4 sm:mb-5"><h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">إدارة الفروع</h3><button onclick="UI.closeModal('branchesModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i class="fa-solid fa-xmark text-xl sm:text-2xl"></i></button></div>
                    <div class="space-y-3 mb-4 sm:mb-5 max-h-60 overflow-y-auto" id="branchesList"></div>
                    <div class="flex gap-2"><input type="text" id="newBranchName" class="flex-1 odoo-input" placeholder="اسم الفرع الجديد"><button onclick="BranchesModule.addBranch()" class="odoo-btn-primary">إضافة</button></div>
                </div>
            </div>

            <!-- مودال إعدادات الأعمدة -->
            <div id="columnSettingsModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('columnSettingsModal')">
                <div class="modal-content">
                    <div class="flex justify-between items-center mb-4 sm:mb-5"><h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">تخصيص الأعمدة</h3><button onclick="UI.closeModal('columnSettingsModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i class="fa-solid fa-xmark text-xl sm:text-2xl"></i></button></div>
                    <div class="space-y-3 max-h-80 overflow-y-auto" id="columnsCheckboxes"></div>
                    <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2" id="columnCountIndicator"></div>
                    <button onclick="UI.saveColumnSettings()" class="mt-4 sm:mt-5 w-full odoo-btn-primary py-2 sm:py-3 text-base sm:text-lg">حفظ الإعدادات</button>
                </div>
            </div>

            <!-- مودال المستخدمين -->
            <div id="usersModal" class="modal-overlay" onclick="if(event.target === this) UI.closeModal('usersModal')">
                <div class="modal-content" style="max-width: 650px;">
                    <div class="flex justify-between items-center mb-4 sm:mb-5"><h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">إدارة المستخدمين</h3><button onclick="UI.closeModal('usersModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i class="fa-solid fa-xmark text-xl sm:text-2xl"></i></button></div>
                    <div class="space-y-3 mb-4 sm:mb-5 max-h-60 overflow-y-auto" id="usersList"></div>
                    <div class="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4">
                        <h4 class="font-bold text-slate-700 dark:text-slate-200 mb-3">إضافة مستخدم جديد</h4>
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" id="newUsername" class="odoo-input" placeholder="اسم المستخدم">
                            <input type="password" id="newUserPassword" class="odoo-input" placeholder="كلمة المرور (6 خانات)">
                            <input type="text" id="newUserDisplayName" class="odoo-input" placeholder="الاسم الظاهر">
                            <select id="newUserRole" class="odoo-input">
                                <option value="super_admin">مدير عام</option>
                                <option value="branch_admin" selected>مدير فرع</option>
                                <option value="user">موظف</option>
                            </select>
                            <select id="newUserBranch" class="odoo-input"></select>
                        </div>
                        <button onclick="UsersModule.addNewUser()" class="w-full odoo-btn-primary py-2 text-base">إضافة</button>
                    </div>
                </div>
            </div>

            <!-- مودال التأكيد -->
            <div id="confirmModal" class="modal-overlay">
                <div class="modal-content text-center">
                    <div class="text-4xl sm:text-5xl mb-4 text-rose-500"><i class="fa-solid fa-circle-question"></i></div>
                    <h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-3" id="confirmMessage"></h3>
                    <div class="flex justify-center gap-4 sm:gap-5 mt-5 sm:mt-6">
                        <button onclick="UI.confirmAction(false)" class="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 py-2 sm:py-2.5 px-6 sm:px-8 rounded-lg font-bold text-base sm:text-lg">إلغاء</button>
                        <button onclick="UI.confirmAction(true)" class="bg-rose-500 hover:bg-rose-600 text-white py-2 sm:py-2.5 px-6 sm:px-8 rounded-lg font-bold text-base sm:text-lg">تأكيد</button>
                    </div>
                </div>
            </div>

            <!-- مودال التنبيه -->
            <div id="alertModal" class="modal-overlay">
                <div class="modal-content text-center">
                    <div class="text-4xl sm:text-5xl mb-4 text-odoo-500"><i class="fa-solid fa-circle-info"></i></div>
                    <h3 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-3" id="alertMessage"></h3>
                    <button onclick="UI.closeAlert()" class="odoo-btn-primary py-2 sm:py-2.5 px-8 sm:px-10 text-base sm:text-lg mt-4 sm:mt-5">حسنًا</button>
                </div>
            </div>
        `;
    }

    /**
     * بناء شبكة التقارير
     */
    function buildReportsGrid() {
        const container = document.getElementById('reportsGrid');
        if (!container) return;
        
        const reports = [
            { id: 'office', icon: 'fa-building', color: 'amber', title: 'الموجود في المكتب' },
            { id: 'received', icon: 'fa-check-circle', color: 'emerald', title: 'المستلم في المحل' },
            { id: 'customers', icon: 'fa-users', color: 'sky', title: 'كشف العملاء' },
            { id: 'delayed', icon: 'fa-clock', color: 'rose', title: 'المتأخرات' },
            { id: 'financial', icon: 'fa-money-bill-wave', color: 'green', title: 'تقرير مالي' },
            { id: 'daily', icon: 'fa-calendar-day', color: 'purple', title: 'تقرير يومي' }
        ];
        
        container.innerHTML = reports.map(r => `
            <div class="odoo-card p-4 sm:p-6 rounded-xl">
                <div class="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 class="font-bold text-slate-700 dark:text-slate-200 text-base sm:text-lg">
                        <i class="fa-solid ${r.icon} text-${r.color}-500 ml-2"></i> ${r.title}
                    </h3>
                    <button onclick="ReportsModule.printReport('${r.id}')" class="text-xs sm:text-sm bg-${r.color}-50 dark:bg-${r.color}-900/30 text-${r.color}-700 dark:text-${r.color}-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold">
                        <i class="fa-solid fa-print ml-1"></i> طباعة
                    </button>
                </div>
                <div id="report${r.id.charAt(0).toUpperCase() + r.id.slice(1)}" class="max-h-52 overflow-y-auto text-sm sm:text-base space-y-2"></div>
            </div>
        `).join('');
    }

    // ... (باقي الدوال: renderTable, filterTable, openColumnSettings, إلخ)

    // تصدير جزئي للمتغيرات المطلوبة
    return {
        init,
        currentPage,
        set currentPage(val) { currentPage = val; },
        get currentPage() { return currentPage; },
        // ... باقي الدوال
    };
})();

window.UI = UI;
