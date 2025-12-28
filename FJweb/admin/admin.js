// 管理员脚本

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 隐藏加载动画
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 800);
    }
    
    // 根据当前页面执行不同的初始化
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login.html')) {
        initLoginPage();
    } else if (currentPage.includes('dashboard.html')) {
        initDashboardPage();
    }
});

// 初始化登录页面
function initLoginPage() {
    // 密码显示/隐藏切换
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // 简单验证（在实际应用中，应该与后端API进行验证）
            if (username === 'admin' && password === 'admin123') {
                // 登录成功
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminName', '管理员');
                
                if (remember) {
                    localStorage.setItem('adminRemember', 'true');
                }
                
                // 跳转到管理面板
                window.location.href = 'dashboard.html';
            } else {
                // 登录失败
                showLoginError('账号或密码错误');
            }
        });
    }
    
    // 检查是否有保存的登录信息
    checkSavedLogin();
}

// 显示登录错误
function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.style.display = 'flex';
        
        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// 检查保存的登录信息
function checkSavedLogin() {
    const remember = localStorage.getItem('adminRemember');
    
    if (remember === 'true') {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        
        if (isLoggedIn === 'true') {
            // 自动跳转到管理面板
            window.location.href = 'dashboard.html';
        }
    }
}

// 初始化仪表板页面
function initDashboardPage() {
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化数据
    loadDashboardData();
    
    // 绑定事件
    bindDashboardEvents();
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (isLoggedIn !== 'true') {
        // 未登录，跳转到登录页面
        window.location.href = 'login.html';
        return false;
    }
    
    // 显示管理员信息
    const adminName = localStorage.getItem('adminName') || '管理员';
    const adminNameElement = document.querySelector('.admin-name');
    const adminAvatarElement = document.querySelector('.admin-avatar');
    
    if (adminNameElement) {
        adminNameElement.textContent = adminName;
    }
    
    if (adminAvatarElement) {
        // 显示名字首字母
        const initials = adminName.charAt(0).toUpperCase();
        adminAvatarElement.textContent = initials;
    }
    
    return true;
}

// 加载仪表板数据
function loadDashboardData() {
    // 加载统计数据
    updateStats();
    
    // 加载作品表格
    loadWorksTable();
}

// 更新统计数据
function updateStats() {
    const worksData = getWorksData();
    
    // 计算各类作品数量
    const totalWorks = worksData.length;
    const artWorks = worksData.filter(work => work.category === 'art').length;
    const dlcWorks = worksData.filter(work => work.category === 'dlc').length;
    const modWorks = worksData.filter(work => work.category === 'mod').length;
    const availableWorks = worksData.filter(work => work.status === 'available').length;
    
    // 更新统计卡片
    updateStatCard('total-works', totalWorks, '全部作品');
    updateStatCard('art-works', artWorks, '美术作品');
    updateStatCard('dlc-works', dlcWorks, '游戏DLC');
    updateStatCard('mod-works', modWorks, '游戏Mod');
    
    // 更新可用作品数量
    const availableElement = document.getElementById('available-works');
    if (availableElement) {
        availableElement.textContent = `${availableWorks} / ${totalWorks}`;
    }
}

// 更新统计卡片
function updateStatCard(elementId, count, label) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = count;
        
        // 同时更新父元素中的标签
        const parent = element.parentElement;
        if (parent) {
            const labelElement = parent.querySelector('p');
            if (labelElement) {
                labelElement.textContent = label;
            }
        }
    }
}

// 加载作品表格
function loadWorksTable() {
    const worksData = getWorksData();
    const tableBody = document.querySelector('.works-table tbody');
    
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 按日期降序排序
    const sortedWorks = [...worksData].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // 填充表格
    sortedWorks.forEach(work => {
        const row = document.createElement('tr');
        
        // 状态徽章
        const statusClass = work.status === 'available' ? 'status-available' : 'status-unavailable';
        const statusText = work.status === 'available' ? '已上架' : '已下架';
        
        // 分类徽章
        const categoryName = getCategoryName(work.category);
        
        row.innerHTML = `
            <td>
                <img src="${work.image}" alt="${work.title}" class="work-image-small" onerror="this.src='https://images.unsplash.com/photo-1581338834647-b5fb60c6cfde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'">
            </td>
            <td>
                <strong>${work.title}</strong><br>
                <small>${work.author}</small>
            </td>
            <td>
                <span class="category-badge">${categoryName}</span>
            </td>
            <td>${work.date}</td>
            <td>${work.likes || 0}</td>
            <td>${work.downloads || 0}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" data-id="${work.id}">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn-action btn-delete" data-id="${work.id}">
                        <i class="fas fa-${work.status === 'available' ? 'trash' : 'check'}"></i>
                        ${work.status === 'available' ? '下架' : '上架'}
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 绑定表格按钮事件
    bindTableEvents();
}

// 绑定表格事件
function bindTableEvents() {
    // 编辑按钮
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const workId = parseInt(this.getAttribute('data-id'));
            openEditForm(workId);
        });
    });
    
    // 删除/上架/下架按钮
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const workId = parseInt(this.getAttribute('data-id'));
            toggleWorkStatusAdmin(workId);
        });
    });
}

// 打开编辑表单
function openEditForm(workId) {
    const worksData = getWorksData();
    const work = worksData.find(w => w.id === workId);
    
    if (!work) {
        alert('未找到该作品');
        return;
    }
    
    // 填充表单数据
    document.getElementById('edit-title').value = work.title;
    document.getElementById('edit-author').value = work.author;
    document.getElementById('edit-date').value = work.date;
    document.getElementById('edit-category').value = work.category;
    document.getElementById('edit-image').value = work.image;
    document.getElementById('edit-description').value = work.description;
    document.getElementById('edit-details').value = work.details.replace(/<br>/g, '\n');
    document.getElementById('edit-tags').value = work.tags ? work.tags.join(', ') : '';
    document.getElementById('edit-likes').value = work.likes || 0;
    document.getElementById('edit-downloads').value = work.downloads || 0;
    document.getElementById('edit-status').value = work.status;
    
    // 设置表单的data-id属性
    const editForm = document.getElementById('edit-form');
    editForm.setAttribute('data-id', workId);
    
    // 显示表单模态框
    document.getElementById('edit-modal').style.display = 'flex';
}

// 切换作品状态（管理员界面）
function toggleWorkStatusAdmin(workId) {
    const worksData = getWorksData();
    const workIndex = worksData.findIndex(w => w.id === workId);
    
    if (workIndex === -1) return;
    
    const work = worksData[workIndex];
    const newStatus = work.status === 'available' ? 'unavailable' : 'available';
    const confirmAction = confirm(`确定要${newStatus === 'unavailable' ? '下架' : '重新上架'}作品"${work.title}"吗？`);
    
    if (confirmAction) {
        worksData[workIndex].status = newStatus;
        localStorage.setItem('workshopWorks', JSON.stringify(worksData));
        
        // 重新加载表格和统计数据
        loadWorksTable();
        updateStats();
        
        alert(`作品"${work.title}"已${newStatus === 'unavailable' ? '下架' : '重新上架'}`);
    }
}

// 绑定仪表板事件
function bindDashboardEvents() {
    // 登出按钮
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const confirmLogout = confirm('确定要退出登录吗？');
            if (confirmLogout) {
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminName');
                window.location.href = 'login.html';
            }
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadDashboardData();
            alert('数据已刷新');
        });
    }
    
    // 添加作品按钮
    const addBtn = document.querySelector('.btn-add');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            openAddForm();
        });
    }
    
    // 表单提交按钮
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWork();
        });
    }
    
    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addWork();
        });
    }
    
    // 表单关闭按钮
    const closeButtons = document.querySelectorAll('.form-modal-close, .btn-cancel');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.form-modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 点击模态框背景关闭
    const modals = document.querySelectorAll('.form-modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// 打开添加表单
function openAddForm() {
    // 清空表单
    const addForm = document.getElementById('add-form');
    addForm.reset();
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('add-date').value = today;
    
    // 显示添加表单模态框
    document.getElementById('add-modal').style.display = 'flex';
}

// 保存作品（编辑）
function saveWork() {
    const workId = parseInt(document.getElementById('edit-form').getAttribute('data-id'));
    const worksData = getWorksData();
    const workIndex = worksData.findIndex(w => w.id === workId);
    
    if (workIndex === -1) {
        alert('未找到该作品');
        return;
    }
    
    // 获取表单数据
    const updatedWork = {
        id: workId,
        title: document.getElementById('edit-title').value,
        author: document.getElementById('edit-author').value,
        date: document.getElementById('edit-date').value,
        category: document.getElementById('edit-category').value,
        image: document.getElementById('edit-image').value,
        description: document.getElementById('edit-description').value,
        details: document.getElementById('edit-details').value.replace(/\n/g, '<br>'),
        tags: document.getElementById('edit-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        likes: parseInt(document.getElementById('edit-likes').value) || 0,
        downloads: parseInt(document.getElementById('edit-downloads').value) || 0,
        status: document.getElementById('edit-status').value
    };
    
    // 更新作品数据
    worksData[workIndex] = updatedWork;
    localStorage.setItem('workshopWorks', JSON.stringify(worksData));
    
    // 关闭模态框
    document.getElementById('edit-modal').style.display = 'none';
    
    // 重新加载表格和统计数据
    loadWorksTable();
    updateStats();
    
    alert('作品信息已更新');
}

// 添加作品
function addWork() {
    const worksData = getWorksData();
    
    // 生成新ID（当前最大ID + 1）
    const maxId = worksData.length > 0 ? Math.max(...worksData.map(w => w.id)) : 0;
    const newId = maxId + 1;
    
    // 获取表单数据
    const newWork = {
        id: newId,
        title: document.getElementById('add-title').value,
        author: document.getElementById('add-author').value,
        date: document.getElementById('add-date').value,
        category: document.getElementById('add-category').value,
        image: document.getElementById('add-image').value || 'https://images.unsplash.com/photo-1581338834647-b5fb60c6cfde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
        description: document.getElementById('add-description').value,
        details: document.getElementById('add-details').value.replace(/\n/g, '<br>'),
        tags: document.getElementById('add-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        likes: 0,
        downloads: 0,
        status: document.getElementById('add-status').value
    };
    
    // 添加到作品数据
    worksData.push(newWork);
    localStorage.setItem('workshopWorks', JSON.stringify(worksData));
    
    // 关闭模态框
    document.getElementById('add-modal').style.display = 'none';
    
    // 重新加载表格和统计数据
    loadWorksTable();
    updateStats();
    
    alert('作品已添加');
}

// 从本地存储获取作品数据（与chuangyi.js共享）
function getWorksData() {
    const storedWorks = localStorage.getItem('workshopWorks');
    
    if (storedWorks) {
        return JSON.parse(storedWorks);
    }
    
    // 如果没有本地数据，返回空数组（在管理后台，可以添加新作品）
    return [];
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        'art': '美术作品',
        'dlc': '游戏DLC',
        'mod': '游戏Mod'
    };
    return names[category] || '其他';
}