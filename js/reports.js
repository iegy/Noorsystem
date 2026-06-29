/**
 * reports.js - التقارير والطباعة
 */

const ReportsModule = (() => {

    /**
     * عرض جميع التقارير
     */
    function renderAllReports() {
        const branchOrders = getBranchOrders();
        
        // الموجود في المكتب
        const office = branchOrders.filter(o => o.status === 'في المكتب');
        document.getElementById('reportOffice').innerHTML = office.length 
            ? office.map(o => `<div class="flex justify-between border-b dark:border-slate-600 pb-2"><span>${o.name} ${o.soNumber||''}</span><span>${o.phone}</span></div>`).join('') 
            : '<p class="text-slate-400">لا يوجد</p>';
        
        // المستلم في المحل
        const received = branchOrders.filter(o => o.status === 'بالمحل');
        document.getElementById('reportReceived').innerHTML = received.length 
            ? received.map(o => `<div class="flex justify-between border-b dark:border-slate-600 pb-2"><span>${o.name} ${o.soNumber||''}</span><span>${o.phone}</span></div>`).join('') 
            : '<p class="text-slate-400">لا يوجد</p>';
        
        // كشف العملاء
        const customers = [...new Set(branchOrders.map(o => o.phone))].map(phone => {
            const cust = branchOrders.find(o => o.phone === phone);
            return { name: cust.name, phone, count: branchOrders.filter(o => o.phone === phone).length };
        });
        document.getElementById('reportCustomers').innerHTML = customers.length 
            ? customers.map(c => `<div class="flex justify-between border-b dark:border-slate-600 pb-2"><span>${c.name} (${c.count})</span><span>${c.phone}</span></div>`).join('') 
            : '<p class="text-slate-400">لا يوجد</p>';
        
        // المتأخرات
        const delayed = branchOrders
            .filter(o => o.status === 'في المكتب' && getDaysSince(o.date) >= 7)
            .sort((a, b) => getDaysSince(b.date) - getDaysSince(a.date));
        document.getElementById('reportDelayed').innerHTML = delayed.length 
            ? delayed.map(o => {
                const d = getDaysSince(o.date);
                return `<div class="flex justify-between border-b dark:border-slate-600 pb-2 ${d>=30?'text-red-600':d>=14?'text-red-500':'text-amber-600'}"><span>${o.name} (${d} يوم)</span><span>${o.phone}</span></div>`;
            }).join('') 
            : '<p class="text-slate-400">لا يوجد</p>';
        
        // تقرير مالي
        const totalAll = branchOrders.reduce((s, o) => s + o.total, 0);
        const totalPaid = branchOrders.reduce((s, o) => s + o.paid, 0);
        const totalRemaining = branchOrders.reduce((s, o) => s + o.remaining, 0);
        document.getElementById('reportFinancial').innerHTML = `
            <div class="flex justify-between"><span>الإجمالي الكلي</span><span class="font-bold">${totalAll} ج.م</span></div>
            <div class="flex justify-between"><span>المدفوع</span><span class="text-emerald-600">${totalPaid} ج.م</span></div>
            <div class="flex justify-between"><span>المتبقي</span><span class="text-rose-600">${totalRemaining} ج.م</span></div>
        `;
        
        // تقرير يومي
        const today = new Date().toLocaleDateString('ar-EG');
        const daily = branchOrders.filter(o => o.date === today);
        document.getElementById('reportDaily').innerHTML = daily.length 
            ? daily.map(o => `<div class="flex justify-between border-b dark:border-slate-600 pb-2"><span>${o.name} ${o.soNumber||''}</span><span>${o.total} ج.م</span></div>`).join('') 
            : '<p class="text-slate-400">لا يوجد طلبات اليوم</p>';
    }

    /**
     * طباعة تقرير
     */
    function printReport(type) {
        const branchOrders = getBranchOrders();
        let title = '', content = '';
        const style = `<style>body{font-family:'Cairo',sans-serif;direction:rtl;text-align:right;padding:30px;color:#000}h2{text-align:center;margin-bottom:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;font-size:12px}th{background:#f0f0f0}.footer{margin-top:30px;text-align:center;font-size:10px}</style>`;
        
        switch(type) {
            case 'office':
                title = 'كشف الموجود في المكتب';
                const office = branchOrders.filter(o => o.status === 'في المكتب');
                content = office.length ? createTable(office, ['date','soNumber','name','phone','type','total']) : '<p>لا توجد طلبات</p>';
                break;
            case 'received':
                title = 'كشف المستلم في المحل';
                const received = branchOrders.filter(o => o.status === 'بالمحل');
                content = received.length ? createTable(received, ['date','soNumber','name','phone','type','total']) : '<p>لا توجد طلبات</p>';
                break;
            case 'customers':
                title = 'كشف العملاء';
                const custs = [...new Set(branchOrders.map(o => o.phone))].map(phone => {
                    const o = branchOrders.find(o => o.phone === phone);
                    return { name: o.name, phone, count: branchOrders.filter(o => o.phone === phone).length };
                });
                content = custs.length ? `<table><tr><th>العميل</th><th>الهاتف</th><th>عدد الطلبات</th></tr>${custs.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.count}</td></tr>`).join('')}</table>` : '<p>لا يوجد عملاء</p>';
                break;
            case 'delayed':
                title = 'كشف المتأخرات';
                const delayed = branchOrders.filter(o => o.status === 'في المكتب' && getDaysSince(o.date) >= 7);
                content = delayed.length ? `<table><tr><th>تاريخ</th><th>عميل</th><th>هاتف</th><th>أيام التأخير</th></tr>${delayed.map(o => `<tr><td>${o.date}</td><td>${o.name}</td><td>${o.phone}</td><td style="color:red">${getDaysSince(o.date)} يوم</td></tr>`).join('')}</table>` : '<p>لا توجد طلبات متأخرة</p>';
                break;
            case 'financial':
                title = 'تقرير مالي';
                const totalAll = branchOrders.reduce((s,o) => s + o.total, 0);
                const totalPaid = branchOrders.reduce((s,o) => s + o.paid, 0);
                const totalRemaining = branchOrders.reduce((s,o) => s + o.remaining, 0);
                content = `<p><strong>الإجمالي:</strong> ${totalAll} ج.م | <strong>المدفوع:</strong> ${totalPaid} ج.م | <strong>المتبقي:</strong> ${totalRemaining} ج.م</p>`;
                content += createTable(branchOrders, ['name','total','paid','remaining']);
                break;
            case 'daily':
                title = 'تقرير يومي';
                const today = new Date().toLocaleDateString('ar-EG');
                const daily = branchOrders.filter(o => o.date === today);
                content = daily.length ? createTable(daily, ['soNumber','name','phone','type','total']) : '<p>لا توجد طلبات اليوم</p>';
                break;
        }
        
        const printWin = window.open('', '_blank', 'width=900,height=600');
        printWin.document.write(`<html dir="rtl"><head><title>${title}</title>${style}</head><body><h2>${title} - نور للبصريات - ${FirebaseModule.currentBranch}</h2>${content}<p class="footer">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p></body></html>`);
        printWin.document.close();
        printWin.focus();
        printWin.print();
    }

    /**
     * مساعدة: الحصول على طلبات الفرع الحالي
     */
    function getBranchOrders() {
        const currentBranch = FirebaseModule.currentBranch;
        const user = FirebaseModule.currentUser;
        
        if (user?.role === 'super_admin' && currentBranch === 'all') {
            return FirebaseModule.orders;
        } else if (user?.role === 'branch_admin') {
            return FirebaseModule.orders.filter(o => (o.branch || 'رشيد') === user.branch);
        }
        return FirebaseModule.orders.filter(o => (o.branch || 'رشيد') === currentBranch);
    }

    /**
     * مساعدة: إنشاء جدول HTML
     */
    function createTable(data, columns) {
        const headers = {
            date: 'التاريخ', soNumber: 'رقم SO', name: 'العميل', phone: 'الهاتف',
            type: 'النوع', total: 'الإجمالي', paid: 'المدفوع', remaining: 'المتبقي'
        };
        let html = '<table><tr>';
        columns.forEach(col => html += `<th>${headers[col]}</th>`);
        html += '</tr>';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                let val = row[col] || '';
                if (col === 'total' || col === 'paid' || col === 'remaining') val += ' ج.م';
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }

    /**
     * تصدير Excel
     */
    function exportExcel() {
        const branchOrders = getBranchOrders();
        const data = branchOrders.map(o => ({
            "التاريخ": o.date,
            "الفرع": o.branch || '',
            "رقم SO": o.soNumber || "",
            "العميل": o.name,
            "الهاتف": o.phone,
            "النوع": o.type,
            "الإجمالي": o.total,
            "المدفوع": o.paid,
            "المتبقي": o.remaining,
            "التواجد": o.status,
            "التسليم": o.delivery || "لم يتم",
            "ملاحظات": o.notes || "",
            "أيام": getDaysSince(o.date)
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, FirebaseModule.currentBranch);
        XLSX.writeFile(wb, `تقرير_${FirebaseModule.currentBranch}.xlsx`);
    }

    /**
     * تصدير JSON
     */
    function exportJSON() {
        const branchOrders = getBranchOrders();
        if (!branchOrders.length) {
            UI.showAlert("لا بيانات");
            return;
        }
        const blob = new Blob([JSON.stringify(branchOrders, null, 2)], { type: "application/json" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `نسخة_${FirebaseModule.currentBranch}.json`;
        a.click();
    }

    /**
     * استيراد JSON
     */
    async function importJSON(event) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) {
            UI.showAlert('لا صلاحية');
            return;
        }
        
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    UI.showConfirm("استبدال بيانات الفرع الحالي أم دمجها؟", async (replace) => {
                        if (replace) {
                            const snapshot = await FirebaseModule.db.collection("orders")
                                .where("branch", "==", FirebaseModule.currentBranch).get();
                            const batch = FirebaseModule.db.batch();
                            snapshot.docs.forEach(doc => batch.delete(doc.ref));
                            await batch.commit();
                        }
                        
                        for (const d of data) {
                            d.branch = FirebaseModule.currentBranch;
                            d.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                            await FirebaseModule.addOrder(d);
                        }
                        
                        UI.showAlert("تم الاستيراد بنجاح");
                    });
                } else {
                    UI.showAlert("ملف غير صالح");
                }
            } catch (ex) {
                UI.showAlert("خطأ في الملف");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    /**
     * مساعدة: حساب عدد الأيام منذ تاريخ معين
     */
    function getDaysSince(dateStr) {
        if (!dateStr) return 0;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return 0;
        const d = new Date(parts[2], parts[1] - 1, parts[0]);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.floor((now - d) / (1000 * 60 * 60 * 24));
    }

    // الواجهة العامة
    return {
        renderAllReports,
        printReport,
        exportExcel,
        exportJSON,
        importJSON,
        getDaysSince: getDaysSince
    };
})();

window.ReportsModule = ReportsModule;
