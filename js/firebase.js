/**
 * firebase.js - تهيئة Firebase والاتصال بقاعدة البيانات
 */

// تهيئة Firebase
firebase.initializeApp(window.APP_CONFIG.FIREBASE_CONFIG);

const FirebaseModule = (() => {
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // متغيرات عامة
    let orders = [];
    let branches = [...window.APP_CONFIG.DEFAULT_BRANCHES];
    let currentUser = null;
    let currentBranch = 'all';
    let unsubscribeListener = null;

    /**
     * تحميل البيانات الحية من Firestore
     */
    function loadOrders() {
        if (unsubscribeListener) {
            unsubscribeListener();
        }

        console.log("بدء الاستماع للتغييرات في Firebase...");

        unsubscribeListener = db.collection("orders")
            .orderBy("createdAt", "desc")
            .onSnapshot((snapshot) => {
                const newOrders = [];
                snapshot.forEach((doc) => {
                    newOrders.push({ id: doc.id, ...doc.data() });
                });
                orders = newOrders;
                
                // إشعار واجهة المستخدم بالتحديث
                if (typeof UI !== 'undefined' && UI.renderTable) {
                    UI.renderTable();
                }
                
                console.log(`✅ تم تحديث البيانات: ${orders.length} طلب`);
            }, (error) => {
                console.error("❌ خطأ في جلب البيانات:", error);
                if (typeof UI !== 'undefined' && UI.showAlert) {
                    UI.showAlert("تعذر الاتصال بقاعدة البيانات");
                }
            });

        return unsubscribeListener;
    }

    /**
     * إضافة طلب جديد
     */
    async function addOrder(orderData) {
        try {
            const docRef = await db.collection("orders").add(orderData);
            console.log("✅ تمت إضافة الطلب:", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("❌ فشل في إضافة الطلب:", e);
            throw e;
        }
    }

    /**
     * تحديث طلب
     */
    async function updateOrder(orderId, orderData) {
        try {
            await db.collection("orders").doc(orderId).set(orderData, { merge: true });
            console.log("✅ تم تحديث الطلب:", orderId);
        } catch (e) {
            console.error("❌ فشل في تحديث الطلب:", e);
            throw e;
        }
    }

    /**
     * حذف طلب
     */
    async function deleteOrder(orderId) {
        try {
            await db.collection("orders").doc(orderId).delete();
            console.log("✅ تم حذف الطلب:", orderId);
        } catch (e) {
            console.error("❌ فشل في حذف الطلب:", e);
            throw e;
        }
    }

    /**
     * تحميل الفروع
     */
    async function loadBranches() {
        try {
            const doc = await db.collection('branches').doc('list').get();
            if (doc.exists && doc.data().names) {
                branches = doc.data().names;
            } else {
                await db.collection('branches').doc('list').set({ names: branches });
            }
            return branches;
        } catch (e) {
            console.error("خطأ في تحميل الفروع:", e);
            return branches;
        }
    }

    /**
     * حفظ الفروع
     */
    async function saveBranches(branchList) {
        try {
            await db.collection('branches').doc('list').set({ names: branchList });
            branches = branchList;
        } catch (e) {
            console.error("خطأ في حفظ الفروع:", e);
            throw e;
        }
    }

    /**
     * تحميل بيانات مستخدم
     */
    async function loadUser(username) {
        try {
            const doc = await db.collection('users').doc(username).get();
            if (doc.exists) {
                return { username, ...doc.data() };
            } else {
                const defaultUser = {
                    username,
                    name: username === 'admin' ? 'مدير النظام' : 'موظف استقبال',
                    role: username === 'admin' ? 'super_admin' : 'user',
                    branch: 'رشيد'
                };
                await db.collection('users').doc(username).set(defaultUser);
                return defaultUser;
            }
        } catch (e) {
            console.error("خطأ في تحميل بيانات المستخدم:", e);
            return null;
        }
    }

    /**
     * تحميل جميع المستخدمين
     */
    async function loadAllUsers() {
        try {
            const snapshot = await db.collection('users').get();
            const users = [];
            snapshot.forEach(doc => {
                users.push({ username: doc.id, ...doc.data() });
            });
            return users;
        } catch (e) {
            console.error("خطأ في تحميل المستخدمين:", e);
            return [];
        }
    }

    /**
     * حفظ مستخدم
     */
    async function saveUser(username, userData) {
        try {
            await db.collection('users').doc(username).set(userData, { merge: true });
        } catch (e) {
            console.error("خطأ في حفظ المستخدم:", e);
            throw e;
        }
    }

    /**
     * حذف مستخدم
     */
    async function deleteUser(username) {
        try {
            await db.collection('users').doc(username).delete();
        } catch (e) {
            console.error("خطأ في حذف المستخدم:", e);
            throw e;
        }
    }

    /**
     * تحميل إعدادات الأعمدة لمستخدم
     */
    async function loadColumnSettings(username) {
        try {
            const doc = await db.collection('user_settings').doc(username).get();
            if (doc.exists && doc.data().columns) {
                return doc.data().columns;
            }
        } catch (e) {
            console.error("خطأ في تحميل إعدادات الأعمدة:", e);
        }
        return null;
    }

    /**
     * حفظ إعدادات الأعمدة لمستخدم
     */
    async function saveColumnSettings(username, columns) {
        try {
            await db.collection('user_settings').doc(username).set({ columns }, { merge: true });
        } catch (e) {
            console.error("خطأ في حفظ إعدادات الأعمدة:", e);
        }
    }

    // الواجهة العامة
    return {
        db,
        auth,
        get orders() { return orders; },
        set orders(val) { orders = val; },
        get branches() { return branches; },
        set branches(val) { branches = val; },
        get currentUser() { return currentUser; },
        set currentUser(val) { currentUser = val; },
        get currentBranch() { return currentBranch; },
        set currentBranch(val) { currentBranch = val; },
        loadOrders,
        addOrder,
        updateOrder,
        deleteOrder,
        loadBranches,
        saveBranches,
        loadUser,
        loadAllUsers,
        saveUser,
        deleteUser,
        loadColumnSettings,
        saveColumnSettings
    };
})();

// تصدير للمتغير العام
window.FirebaseModule = FirebaseModule;
