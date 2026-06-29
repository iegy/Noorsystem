/**
 * orders.js - إدارة الطلبات
 */

const OrdersModule = (() => {

    async function addOrder(event) {
        event.preventDefault();
        
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const dateValue = document.getElementById('orderDate')?.value;
        let formattedDate;
        if (dateValue) {
            const [y, m, d] = dateValue.split('-');
            formattedDate = `${d}/${m}/${y}`;
        } else {
            const now = new Date();
            formattedDate = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
        }
        
        const total = parseFloat(document.getElementById('totalPrice')?.value) || 0;
        const paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
        let orderBranch = FirebaseModule.currentBranch;
        
        if (user.role === 'super_admin' && FirebaseModule.currentBranch === 'all') {
            orderBranch = FirebaseModule.branches[0] || 'رشيد';
        }
        
        const newOrder = {
            date: formattedDate,
            branch: orderBranch,
            soNumber: document.getElementById('orderSoNumber')?.value?.trim() || '',
            name: document.getElementById('custName')?.value?.trim() || 'بدون اسم',
            phone: document.getElementById('custPhone')?.value?.trim() || 'غير متوفر',
            type: document.getElementById('orderType')?.value || 'نظارة وعدسات جديدة',
            status: document.getElementById('orderStatus')?.value || 'في المكتب',
            delivery: document.getElementById('deliveryStatus')?.value || 'لم يتم',
            notes: document.getElementById('orderNotes')?.value?.trim() || '',
            total,
            paid,
            remaining: total - paid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            await FirebaseModule.addOrder(newOrder);
            
            const form = document.getElementById('orderForm');
            if (form) form.reset();
            
            const orderDateEl = document.getElementById('orderDate');
            if (orderDateEl) orderDateEl.value = new Date().toISOString().split('T')[0];
            
            const remainingEl = document.getElementById('remainingAmount');
            if (remainingEl) remainingEl.value = 0;
            
            const formCollapsible = document.getElementById('formCollapsible');
            if (formCollapsible && formCollapsible.classList.contains('open')) {
                UI.toggleOrderForm();
            }
        } catch (e) {
            console.error("❌ فشل في إضافة الطلب:", e);
            UI.showAlert("حدث خطأ أثناء حفظ الطلب");
        }
    }

    async function toggleStatus(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        if (order) {
            order.status = order.status === 'في المكتب' ? 'بالمحل' : 'في المكتب';
            await FirebaseModule.updateOrder(orderId, order);
        }
    }

    async function toggleDelivery(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        if (order) {
            order.delivery = order.delivery === 'لم يتم' ? 'تم التسليم' : 'لم يتم';
            await FirebaseModule.updateOrder(orderId, order);
        }
    }

    async function deleteOrder(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        UI.showConfirm("هل أنت متأكد من حذف هذا الطلب؟", async (ok) => {
            if (ok) {
                await FirebaseModule.deleteOrder(orderId);
            }
        });
    }

    function openEditModal(orderId) {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const editId = document.getElementById('editId');
        const editDate = document.getElementById('editDate');
        const editName = document.getElementById('editName');
        const editPhone = document.getElementById('editPhone');
        const editSoNumber = document.getElementById('editSoNumber');
        const editType = document.getElementById('editType');
        const editStatus = document.getElementById('editStatus');
        const editDelivery = document.getElementById('editDelivery');
        const editTotal = document.getElementById('editTotal');
        const editPaid = document.getElementById('editPaid');
        const editRemaining = document.getElementById('editRemaining');
        const editNotes = document.getElementById('editNotes');
        
        if (editId) editId.value = order.id;
        
        const parts = order.date.split('/');
        if (editDate && parts.length === 3) {
            editDate.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else if (editDate) {
            editDate.value = '';
        }
        
        if (editName) editName.value = order.name;
        if (editPhone) editPhone.value = order.phone;
        if (editSoNumber) editSoNumber.value = order.soNumber || '';
        if (editType) editType.value = order.type;
        if (editStatus) editStatus.value = order.status;
        if (editDelivery) editDelivery.value = order.delivery || 'لم يتم';
        if (editTotal) editTotal.value = order.total;
        if (editPaid) editPaid.value = order.paid;
        if (editRemaining) editRemaining.value = order.remaining;
        if (editNotes) editNotes.value = order.notes || '';
        
        const editModal = document.getElementById('editModal');
        if (editModal) editModal.classList.add('active');
    }

    async function saveEdit(event) {
        event.preventDefault();
        
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const orderId = document.getElementById('editId')?.value;
        const order = FirebaseModule.orders.find(o => o.id === orderId);
        
        if (order) {
            const dateValue = document.getElementById('editDate')?.value;
            let formattedDate = order.date;
            if (dateValue) {
                const [y, m, d] = dateValue.split('-');
                formattedDate = `${d}/${m}/${y}`;
            }
            
            order.date = formattedDate;
            order.name = document.getElementById('editName')?.value?.trim() || 'بدون اسم';
            order.phone = document.getElementById('editPhone')?.value?.trim() || 'غير متوفر';
            order.soNumber = document.getElementById('editSoNumber')?.value?.trim() || '';
            order.type = document.getElementById('editType')?.value || order.type;
            order.status = document.getElementById('editStatus')?.value || order.status;
            order.delivery = document.getElementById('editDelivery')?.value || order.delivery;
            order.total = parseFloat(document.getElementById('editTotal')?.value) || 0;
            order.paid = parseFloat(document.getElementById('editPaid')?.value) || 0;
            order.remaining = Math.max(0, order.total - order.paid);
            order.notes = document.getElementById('editNotes')?.value?.trim() || '';
            
            await FirebaseModule.updateOrder(orderId, order);
            
            const editModal = document.getElementById('editModal');
            if (editModal) editModal.classList.remove('active');
        }
    }

    function openQuickAdd() {
        const user = FirebaseModule.currentUser;
        if (!user || (user.role !== 'super_admin' && user.role !== 'branch_admin')) return;
        
        const formCollapsible = document.getElementById('formCollapsible');
        const formToggleIcon = document.getElementById('formToggleIcon');
        
        if (formCollapsible && !formCollapsible.classList.contains('open')) {
            formCollapsible.classList.add('open');
            if (formToggleIcon) {
                formToggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        }
        
        const orderDate = document.getElementById('orderDate');
        const custName = document.getElementById('custName');
        const custPhone = document.getElementById('custPhone');
        const orderSoNumber = document.getElementById('orderSoNumber');
        const totalPrice = document.getElementById('totalPrice');
        const paidAmount = document.getElementById('paidAmount');
        const remainingAmount = document.getElementById('remainingAmount');
        const orderNotes = document.getElementById('orderNotes');
        const orderStatus = document.getElementById('orderStatus');
        const deliveryStatus = document.getElementById('deliveryStatus');
        
        if (orderDate) orderDate.value = new Date().toISOString().split('T')[0];
        if (custName) custName.value = 'عميل كاش';
        if (custPhone) custPhone.value = 'غير متوفر';
        if (orderSoNumber) orderSoNumber.value = '';
        if (totalPrice) totalPrice.value = '';
        if (paidAmount) paidAmount.value = '0';
        if (remainingAmount) remainingAmount.value = '0';
        if (orderNotes) orderNotes.value = '';
        if (orderStatus) orderStatus.value = 'في المكتب';
        if (deliveryStatus) deliveryStatus.value = 'لم يتم';
        if (custName) custName.focus();
    }

    function calcRemaining() {
        const total = parseFloat(document.getElementById('totalPrice')?.value) || 0;
        const paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
        const remaining = document.getElementById('remainingAmount');
        if (remaining) remaining.value = Math.max(0, total - paid);
    }

    function updateEditRemaining() {
        const total = parseFloat(document.getElementById('editTotal')?.value) || 0;
        const paid = parseFloat(document.getElementById('editPaid')?.value) || 0;
        const remaining = document.getElementById('editRemaining');
        if (remaining) remaining.value = Math.max(0, total - paid);
    }

    return {
        addOrder,
        toggleStatus,
        toggleDelivery,
        deleteOrder,
        openEditModal,
        saveEdit,
        openQuickAdd,
        calcRemaining,
        updateEditRemaining
    };
})();

window.OrdersModule = OrdersModule;
