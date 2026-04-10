// BASE API URL
const API_BASE = 'http://127.0.0.1:5000/api';

/* ================================
   AUTH CHECK (For Dashboard Pages)
================================ */
async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });

        const data = await res.json();

        if (!data.success || !data.user) {
            window.location.href = 'http://127.0.0.1:5500/frontend/pages/index.html';
        }

    } catch (error) {
        window.location.href = '/frontend/pages/index.html';
    }
}

/* ================================
   TOAST
================================ */
function showToast(message, bg = 'bg-success') {
    let toast = document.getElementById('toastMessage');
    if (!toast) return;

    toast.className = `toast align-items-center text-white ${bg} border-0`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    new bootstrap.Toast(toast).show();
}

/* ================================
   LOGOUT
================================ */
window.logout = async () => {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            credentials: 'include'
        });

        window.location.href = 'http://127.0.0.1:5500/frontend/pages/index.html';
    } catch (err) {
       window.location.href = '/frontend/pages/index.html';
    }
};

/* ================================
   SIDEBAR
================================ */
function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('d-none');
}