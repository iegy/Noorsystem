function sendWhatsApp(phone, name) {
    if (!phone || phone === 'غير متوفر') return;
    let clean = phone.replace(/[^\d]/g, '');
    if (!clean.startsWith('2')) clean = '2' + clean;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(`مرحباً ${name}،\nنود إعلامك بحالة طلبك في نور للبصريات.`)}`, '_blank');
}

function switchTab(tab) {
    const mainTab = document.getElementById('mainTabContent');
    const reportsTab = document.getElementById('reportsTabContent');
    const tabMain = document.getElementById('tabMain');
    const tabReports = document.getElementById('tabReports');
    
    if (tab === 'main') {
        if (mainTab) mainTab.classList.remove('hidden');
        if (reportsTab) reportsTab.classList.add('hidden');
        if (tabMain) { tabMain.classList.add('font-bold', 'border-b-2', 'border-white'); tabMain.classList.remove('font-medium', 'text-white/70'); }
        if (tabReports) { tabReports.classList.add('font-medium', 'text-white/70'); tabReports.classList.remove('font-bold', 'border-b-2', 'border-white'); }
    } else {
        if (mainTab) mainTab.classList.add('hidden');
        if (reportsTab) reportsTab.classList.remove('hidden');
        if (tabReports) { tabReports.classList.add('font-bold', 'border-b-2', 'border-white'); tabReports.classList.remove('font-medium', 'text-white/70'); }
        if (tabMain) { tabMain.classList.add('font-medium', 'text-white/70'); tabMain.classList.remove('font-bold', 'border-b-2', 'border-white'); }
        if (typeof ReportsModule !== 'undefined') ReportsModule.renderAllReports();
    }
}

function switchBranch(branch) {
    if (typeof BranchesModule !== 'undefined') BranchesModule.switchBranch(branch);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('noor_dark_mode') === 'true';
    const icon = document.getElementById('darkModeIcon');
    if (isDark) { document.documentElement.classList.add('dark'); if (icon) icon.className = 'fa-solid fa-sun'; }
    else { document.documentElement.classList.remove('dark'); if (icon) icon.className = 'fa-solid fa-moon'; }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDarkMode();
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    const orderDateEl = document.getElementById('orderDate');
    if (orderDateEl) orderDateEl.value = new Date().toISOString().split('T')[0];
});

window.switchTab = switchTab;
window.switchBranch = switchBranch;
window.sendWhatsApp = sendWhatsApp;
window.loadDarkMode = loadDarkMode;
