/**
 * orders.js - إدارة الطلبات
 */

const OrdersModule = (() => {
    const { db } = FirebaseModule;

    /**
     * إضافة طلب جديد
     */
    async function addOrder(event) {
        event.preventDefault();
        
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const dateValue = document.getElementById('orderDate').value;
        let formattedDate;
        if (dateValue) {
            const [y, m, d] = dateValue.split('-');
            formattedDate = `${d}/${m}/${y}`;
        } else {
            const now = new Date();
            formattedDate = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
        }
        
        const total = parseFloat(document.getElementById('totalPrice').value) || 0;
        const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
        let orderBranch = FirebaseModule.currentBranch;
        
        if (user.role === 'super_admin' && FirebaseModule.currentBranch === 'all') {
            orderBranch = FirebaseModule.branches[0] || 'رشيد';
        }
        
        const newOrder = {
            date: formattedDate,
            branch: orderBranch,
            soNumber: document.getElementById('orderSoNumber').value.trim(),
            name: document.getElementById('custName').value.trim() || 'بدون اسم',
            phone: document.getElementById('custPhone').value.trim() || 'غير متوفر',
            type: document.getElementById('orderType').value,
            status: document.getElementById('orderStatus').value,
            delivery: document.getElementById('deliveryStatus').value,
            notes: document.getElementById('orderNotes').value.trim(),
            total,
            paid,
            remaining: total - paid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            await FirebaseModule.addOrder(newOrder);
            
            document.getElementById('orderForm').reset();
            document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('remainingAmount').value = 0;
            
            if (document.getElementById('formCollapsible').classList.contains('open')) {
                UI.toggleOrderForm();
            }
        } catch (e) {
            UI.showAlert("حدث خطأ أثناء حفظ الطلب");
        }
    }

    /**
     * تبديل حالة التواجد
     */
    async function toggleStatus(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        if (order) {
            order.status = order.status === 'في المكتب' ? 'بالمحل' : 'في المكتب';
            await FirebaseModule.updateOrder(orderId, order);
        }
    }

    /**
     * تبديل حالة التسليم
     */
    async function toggleDelivery(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        if (order) {
            order.delivery = order.delivery === 'لم يتم' ? 'تم التسليم' : 'لم يتم';
            await FirebaseModule.updateOrder(orderId, order);
        }
    }

    /**
     * حذف طلب
     */
    async function deleteOrder(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        UI.showConfirm("هل أنت متأكد من حذف هذا الطلب؟", async (ok) => {
            if (ok) {
                await FirebaseModule.deleteOrder(orderId);
            }
        });
    }

    /**
     * فتح نموذج التعديل
     */
    function openEditModal(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        if (!order) return;
        
        document.getElementById('editId').value = order.id;
        
        const parts = order.date.split('/');
        if (parts.length === 3) {
            document.getElementById('editDate').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
            document.getElementById('editDate').value = '';
        }
        
        document.getElementById('editName').value = order.name;
        document.getElementById('editPhone').value = order.phone;
        document.getElementById('editSoNumber').value = order.soNumber || '';
        document.getElementById('editType').value = order.type;
        document.getElementById('editStatus').value = order.status;
        document.getElementById('editDelivery').value = order.delivery || 'لم يتم';
        document.getElementById('editTotal').value = order.total;
        document.getElementById('editPaid').value = order.paid;
        document.getElementById('editRemaining').value = order.remaining;
        document.getElementById('editNotes').value = order.notes || '';
        
        document.getElementById('editModal').classList.add('active');
    }

    /**
     * حفظ التعديلات
     */
    async function saveEdit(event) {
        event.preventDefault();
        
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const orderId = document.getElementById('editId').value;
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        
        if (order) {
            const dateValue = document.getElementById('editDate').value;
            let formattedDate = order.date;
            if (dateValue) {
                const [y, m, d] = dateValue.split('-');
                formattedDate = `${d}/${m}/${y}`;
            }
            
            order.date = formattedDate;
            order.name = document.getElementById('editName').value.trim() || 'بدون اسم';
            order.phone = document.getElementById('editPhone').value.trim() || 'غير متوفر';
            order.soNumber = document.getElementById('editSoNumber').value.trim();
            order.type = document.getElementById('editType').value;
            order.status = document.getElementById('editStatus').value;
            order.delivery = document.getElementById('editDelivery').value;
            order.total = parseFloat(document.getElementById('editTotal').value) || 0;
            order.paid = parseFloat(document.getElementById('editPaid').value) || 0;
            order.remaining = Math.max(0, order.total - order.paid);
            order.notes = document.getElementById('editNotes').value.trim();
            
            await FirebaseModule.updateOrder(orderId, order);
            UI.closeModal('editModal');
        }
    }

    /**
     * فتح الإضافة السريعة
     */
    function openQuickAdd() {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const formCollapsible = document.getElementById('formCollapsible');
        const formToggleIcon = document.getElementById('formToggleIcon');
        
        if (!formCollapsible.classList.contains('open')) {
            formCollapsible.classList.add('open');
            formToggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
        
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('custName').value = 'عميل كاش';
        document.getElementById('custPhone').value = 'غير متوفر';
        document.getElementById('orderSoNumber').value = '';
        document.getElementById('totalPrice').value = '';
        document.getElementById('paidAmount').value = '0';
        document.getElementById('remainingAmount').value = '0';
        document.getElementById('orderNotes').value = '';
        document.getElementById('orderStatus').value = 'في المكتب';
        document.getElementById('deliveryStatus').value = 'لم يتم';
        document.getElementById('custName').focus();
    }

    /**
     * حساب المتبقي
     */
    function calcRemaining() {
        const total = parseFloat(document.getElementById('totalPrice').value) || 0;
        const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
        document.getElementById('remainingAmount').value = Math.max(0, total - paid);
    }

    /**
     * حساب المتبقي في نموذج التعديل
     */
    function updateEditRemaining() {
        const total = parseFloat(document.getElementById('editTotal').value) || 0;
        const paid = parseFloat(document.getElementById('editPaid').value) || 0;
        document.getElementById('editRemaining').value = Math.max(0, total - paid);
    }

    // ربط الأحداث
    document.getElementById('orderForm').addEventListener('submit', addOrder);
    document.getElementById('editForm').addEventListener('submit', saveEdit);

    // الواجهة العامة
    return {
        addOrder,
        toggleStatus,
        toggleDelivery,
        deleteOrder,
        openEditModal,
        openQuickAdd,
        calcRemaining,
        updateEditRemaining
    };
})();

window.OrdersModule = OrdersModule;
