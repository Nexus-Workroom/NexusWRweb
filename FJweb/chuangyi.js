// 创意工坊主脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initWorkshop();
    
    // 检查管理员登录状态
    checkAdminStatus();
});

// 初始化创意工坊
function initWorkshop() {
    // 隐藏加载动画
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 800);
    }
    
    // 初始化作品展示
    renderWorks('all');
    
    // 设置筛选按钮事件
    setupFilterButtons();
    
    // 设置加载更多按钮事件
    setupLoadMoreButton();
    
    // 设置模态框关闭事件
    setupModalClose();
    
    // 设置导航栏汉堡菜单
    setupHamburgerMenu();
}

// 检查管理员登录状态
function checkAdminStatus() {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    const adminNavItem = document.querySelector('.admin-only');
    const adminLink = document.querySelector('.admin-link');
    
    if (isAdmin && adminNavItem && adminLink) {
        adminNavItem.style.display = 'block';
        // 添加管理员标识到链接
        const adminName = localStorage.getItem('adminName') || '管理员';
        adminLink.innerHTML = `<i class="fas fa-user-cog"></i> ${adminName}`;
    }
}

// 渲染作品
function renderWorks(filter = 'all') {
    const grid = document.getElementById('workshop-grid');
    
    // 获取作品数据
    const worksData = getWorksData();
    
    // 筛选作品
    let filteredWorks = worksData;
    
    // 热门筛选逻辑：显示收藏数超过50或下载数超过100的作品
    if (filter === 'hot') {
        filteredWorks = worksData.filter(work => 
            (work.likes && work.likes > 50) || 
            (work.downloads && work.downloads > 100) ||
            (work.tags && work.tags.includes('热门'))
        );
    } else if (filter !== 'all') {
        filteredWorks = worksData.filter(work => work.category === filter);
    }
    
    // 如果筛选后没有作品
    if (filteredWorks.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-fish"></i>
                <h3>暂无此类作品</h3>
                <p>当前分类下还没有作品，快来发布你的第一个创作吧！</p>
            </div>
        `;
        return;
    }
    
    // 清空网格
    grid.innerHTML = '';
    
    // 渲染作品
    filteredWorks.forEach(work => {
        const workElement = createWorkElement(work);
        grid.appendChild(workElement);
    });
}

// 创建作品元素
function createWorkElement(work) {
    const workElement = document.createElement('div');
    workElement.className = 'work-item';
    workElement.dataset.id = work.id;
    
    // 根据分类设置标签样式
    const tagClass = getTagClass(work.category);
    const categoryName = getCategoryName(work.category);
    
    // 状态标签
    const statusClass = work.status === 'available' ? 'available' : 'unavailable';
    const statusText = work.status === 'available' ? '已上架' : '已下架';
    
    workElement.innerHTML = `
        <div class="work-status ${statusClass}">${statusText}</div>
        <img src="${work.image}" alt="${work.title}" class="work-image" onerror="this.src='https://images.unsplash.com/photo-1581338834647-b5fb60c6cfde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'">
        <div class="work-info">
            <h3 class="work-title">${work.title}</h3>
            <div class="work-author">
                <i class="fas fa-user"></i> ${work.author}
            </div>
            <p class="work-description">${work.description}</p>
            <div class="work-tags">
                <span class="work-tag ${tagClass}">${categoryName}</span>
                ${work.tags && work.tags.slice(1, 3).map(tag => 
                    `<span class="work-tag ${tag === '热门' ? 'hot' : ''}">${tag}</span>`
                ).join('')}
                ${work.likes ? `<span class="work-tag"><i class="fas fa-heart"></i> ${work.likes}</span>` : ''}
                ${work.downloads ? `<span class="work-tag"><i class="fas fa-download"></i> ${work.downloads}</span>` : ''}
            </div>
        </div>
    `;
    
    // 添加点击事件
    workElement.addEventListener('click', () => openWorkModal(work.id));
    
    return workElement;
}

// 打开作品详情模态框
function openWorkModal(workId) {
    const worksData = getWorksData();
    const work = worksData.find(w => w.id === workId);
    if (!work) return;
    
    // 填充模态框内容
    document.getElementById('modal-image').src = work.image;
    document.getElementById('modal-image').alt = work.title;
    document.getElementById('modal-title').textContent = work.title;
    document.getElementById('modal-author').textContent = work.author;
    document.getElementById('modal-date').textContent = work.date;
    document.getElementById('modal-description').textContent = work.description;
    document.getElementById('modal-details').innerHTML = work.details;
    
    // 设置状态
    const statusText = work.status === 'available' ? '已上架' : '已下架';
    document.getElementById('modal-status').textContent = statusText;
    
    // 生成标签
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = '';
    
    if (work.tags && work.tags.length > 0) {
        work.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'modal-tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }
    
    // 设置收藏按钮状态
    const favoriteBtn = document.getElementById('favorite-btn');
    const isFavorited = localStorage.getItem(`favorite_${work.id}`) === 'true';
    updateFavoriteButton(favoriteBtn, isFavorited);
    
    // 添加收藏按钮事件
    favoriteBtn.onclick = function() {
        const newState = localStorage.getItem(`favorite_${work.id}`) !== 'true';
        localStorage.setItem(`favorite_${work.id}`, newState.toString());
        updateFavoriteButton(favoriteBtn, newState);
    };
    
    // 检查是否是管理员，显示管理按钮
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    const adminActions = document.querySelector('.admin-actions');
    if (isAdmin && adminActions) {
        adminActions.style.display = 'flex';
        
        // 设置编辑按钮事件
        const editBtn = document.getElementById('edit-btn');
        editBtn.onclick = function() {
            alert('编辑功能将在管理后台中实现');
            // 在实际应用中，这里会跳转到编辑页面或打开编辑表单
        };
        
        // 设置删除按钮事件
        const deleteBtn = document.getElementById('delete-btn');
        const deleteText = work.status === 'available' ? '下架作品' : '重新上架';
        deleteBtn.innerHTML = `<i class="fas fa-${work.status === 'available' ? 'trash' : 'check'}"></i> ${deleteText}`;
        
        deleteBtn.onclick = function() {
            const confirmAction = confirm(`确定要${work.status === 'available' ? '下架' : '重新上架'}作品"${work.title}"吗？`);
            if (confirmAction) {
                toggleWorkStatus(work.id);
                closeModal();
                // 重新渲染当前分类的作品
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                renderWorks(activeFilter);
            }
        };
    } else if (adminActions) {
        adminActions.style.display = 'none';
    }
    
    // 显示模态框
    document.getElementById('work-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 切换作品状态（上架/下架）
function toggleWorkStatus(workId) {
    const worksData = getWorksData();
    const workIndex = worksData.findIndex(w => w.id === workId);
    
    if (workIndex !== -1) {
        worksData[workIndex].status = worksData[workIndex].status === 'available' ? 'unavailable' : 'available';
        localStorage.setItem('workshopWorks', JSON.stringify(worksData));
    }
}

// 更新收藏按钮状态
function updateFavoriteButton(button, isFavorited) {
    if (isFavorited) {
        button.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
        button.classList.add('active');
    } else {
        button.innerHTML = '<i class="far fa-heart"></i> 收藏作品';
        button.classList.remove('active');
    }
}

// 设置筛选按钮事件
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 给当前点击的按钮添加active类
            this.classList.add('active');
            
            // 获取筛选条件并渲染作品
            const filter = this.dataset.filter;
            renderWorks(filter);
        });
    });
}

// 设置加载更多按钮事件
function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // 初始隐藏加载更多按钮（如果作品数量不多）
    const worksData = getWorksData();
    if (worksData.length <= 8) {
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    let displayedCount = 8; // 初始显示8个作品
    
    loadMoreBtn.addEventListener('click', function() {
        // 显示更多作品
        displayedCount += 4;
        renderMoreWorks(displayedCount);
        
        // 如果已显示所有作品，隐藏按钮
        if (displayedCount >= worksData.length) {
            this.style.display = 'none';
        }
    });
    
    // 初始渲染
    renderMoreWorks(displayedCount);
}

// 渲染更多作品
function renderMoreWorks(count) {
    const grid = document.getElementById('workshop-grid');
    const worksData = getWorksData();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    // 获取筛选后的作品
    let filteredWorks = worksData;
    if (activeFilter === 'hot') {
        filteredWorks = worksData.filter(work => 
            (work.likes && work.likes > 50) || 
            (work.downloads && work.downloads > 100) ||
            (work.tags && work.tags.includes('热门'))
        );
    } else if (activeFilter !== 'all') {
        filteredWorks = worksData.filter(work => work.category === activeFilter);
    }
    
    // 限制显示数量
    const worksToShow = filteredWorks.slice(0, Math.min(count, filteredWorks.length));
    
    // 清空并重新渲染
    grid.innerHTML = '';
    worksToShow.forEach(work => {
        const workElement = createWorkElement(work);
        grid.appendChild(workElement);
    });
    
    // 如果已显示所有作品，隐藏按钮
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (worksToShow.length >= filteredWorks.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// 设置模态框关闭事件
function setupModalClose() {
    const modal = document.getElementById('work-modal');
    const closeBtn = document.getElementById('modal-close');
    
    // 点击关闭按钮关闭模态框
    closeBtn.addEventListener('click', closeModal);
    
    // 点击模态框背景关闭模态框
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 按ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('work-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 设置汉堡菜单
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.agreements-hamburger');
    const navMenu = document.querySelector('.agreements-nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // 点击菜单项后关闭菜单
        const navLinks = document.querySelectorAll('.agreements-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// 获取作品数据
function getWorksData() {
    // 首先尝试从本地存储获取
    const storedWorks = localStorage.getItem('workshopWorks');
    
    if (storedWorks) {
        return JSON.parse(storedWorks);
    }
    
    // 如果没有本地数据，使用默认数据
    const defaultWorks = [
        {
            id: 1,
            title: "深海鱼王概念图",
            author: "海洋艺术家",
            date: "2025-03-15",
            description: "为鱼集征途设计的深海鱼王BOSS概念图，展现了深海神秘生物的设计理念和细节刻画。使用了Photoshop和Blender进行创作，色彩运用上突出深海的幽暗与生物发光效果。",
            details: "作品尺寸: 3840x2160px<br>文件格式: PNG<br>文件大小: 8.7MB<br>使用软件: Photoshop, Blender",
            image: "https://images.unsplash.com/photo-1581338834647-b5fb60c6cfde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            tags: ["热门", "概念设计", "角色设计", "游戏美术"],
            category: "art",
            likes: 128,
            downloads: 56,
            status: "available"
        },
        {
            id: 2,
            title: "珊瑚礁扩展包",
            author: "DLC制作组",
            date: "2025-03-10",
            description: "为游戏添加全新的珊瑚礁生态系统，包含15种新鱼类、5种新植物和3个新任务。该扩展包丰富了游戏的水下世界，增加了探索的乐趣。",
            details: "文件大小: 2.3GB<br>兼容版本: 游戏v2.1+<br>新增内容: 15种鱼类, 5种植物, 3个任务<br>安装方式: 自动安装",
            image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            tags: ["DLC", "扩展包", "新内容", "生态系统"],
            category: "dlc",
            likes: 89,
            downloads: 203,
            status: "available"
        },
        {
            id: 3,
            title: "鱼群行为优化MOD",
            author: "MOD开发者",
            date: "2025-03-05",
            description: "优化游戏中鱼群的AI行为，使鱼群移动更加自然真实。增加了鱼群对不同环境刺激的反应，如躲避捕食者、寻找食物等行为。",
            details: "文件大小: 45MB<br>兼容版本: 游戏v2.0+<br>主要功能: 优化鱼群AI, 增强真实性<br>更新日期: 2025-03-05",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            tags: ["MOD", "AI优化", "游戏体验", "行为模拟"],
            category: "mod",
            likes: 156,
            downloads: 312,
            status: "available"
        },
        {
            id: 4,
            title: "水下城市设定图",
            author: "场景设计师",
            date: "2025-02-20",
            description: "为游戏后续更新设计的水下城市概念图，展示了未来可能加入的水下文明聚落，结合了生物发光与科技元素。",
            details: "作品尺寸: 5000x3000px<br>文件格式: PSD<br>图层数量: 78<br>创作时长: 45小时",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            tags: ["热门", "场景设计", "概念图", "水下世界"],
            category: "art",
            likes: 178,
            downloads: 92,
            status: "available"
        },
        {
            id: 5,
            title: "渔夫职业扩展MOD",
            author: "MOD社区",
            date: "2025-02-15",
            description: "为游戏添加全新的渔夫职业系统，包含钓鱼技能树、专属装备和任务线。让玩家体验从普通捕鱼到深海渔夫的全过程。",
            details: "文件大小: 120MB<br>新增技能: 15种钓鱼技能<br>专属装备: 8套渔夫装备<br>任务线: 5个主线任务",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            tags: ["MOD", "职业系统", "扩展内容", "技能树"],
            category: "mod",
            likes: 203,
            downloads: 415,
            status: "available"
        },
        {
            id: 6,
            title: "海洋生物图鉴DLC",
            author: "生态研究组",
            date: "2025-02-10",
            description: "添加超过100种新的海洋生物到游戏中，每种生物都有详细的生态信息和3D模型，增强游戏的科普和教育价值。",
            details: "新增生物: 102种<br>模型精度: 4K纹理<br>生态信息: 每种生物详细资料<br>交互功能: 生物观察日志",
            image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            tags: ["DLC", "生物图鉴", "教育内容", "3D模型"],
            category: "dlc",
            likes: 167,
            downloads: 289,
            status: "available"
        },
        {
            id: 7,
            title: "美人鱼角色原画",
            author: "角色设计师",
            date: "2025-02-05",
            description: "游戏中美人鱼角色的官方原画设定，展示了角色的三视图、色彩方案和细节设计，为玩家提供角色设计的参考。",
            details: "作品尺寸: 3000x4000px<br>文件格式: JPG<br>色彩模式: RGB<br>设计周期: 2周",
            image: "https://images.unsplash.com/photo-1530539595977-0aa9890543c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
            tags: ["原画", "角色设计", "官方设定", "色彩设计"],
            category: "art",
            likes: 245,
            downloads: 145,
            status: "available"
        },
        {
            id: 8,
            title: "水下光影优化MOD",
            author: "图形MOD组",
            date: "2025-02-01",
            description: "优化游戏的水下光影效果，增强水的折射、反射和散射效果，使水下场景更加真实和沉浸。",
            details: "文件大小: 85MB<br>兼容版本: 游戏v2.0+<br>光影优化: 水折射, 反射, 散射<br>性能影响: 低 (5-10% FPS下降)",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
            tags: ["MOD", "图形优化", "光影效果", "沉浸感"],
            category: "mod",
            likes: 189,
            downloads: 327,
            status: "unavailable"
        }
    ];
    
    // 保存默认数据到本地存储
    localStorage.setItem('workshopWorks', JSON.stringify(defaultWorks));
    
    return defaultWorks;
}

// 辅助函数：获取分类名称
function getCategoryName(category) {
    const names = {
        'art': '美术作品',
        'dlc': '游戏DLC',
        'mod': '游戏Mod',
        'all': '全部',
        'hot': '热门'
    };
    return names[category] || '其他';
}

// 辅助函数：获取标签样式类
function getTagClass(category) {
    return category;
}