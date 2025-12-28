// filepath: G:/网站/index.js
// NexusW.R 现代化网站交互脚本 - 修复版

(() => {
    'use strict';

    // 辅助函数
    const qs = (s, el = document) => el.querySelector(s);
    const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 页面加载状态
    document.documentElement.classList.add('is-loading');
    
    // 导航
    const hamburger = qs('#hamburger');
    const navMenu = qs('#navMenu');
    const navLinks = qsa('.nav-link');
    const navbar = qs('#navbar');

    // 移动端导航切换
    const toggleNav = () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('nav-open');
        document.documentElement.classList.toggle('no-scroll');
    };

    if (hamburger) on(hamburger, 'click', toggleNav);
    
    // 导航链接点击处理
    navLinks.forEach(a => {
        on(a, 'click', e => {
            const href = a.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // 移除所有active类
                    navLinks.forEach(link => link.classList.remove('active'));
                    // 添加当前active类
                    a.classList.add('active');
                    
                    // 平滑滚动到目标
                    target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }
            // 移动端关闭导航
            if (window.innerWidth <= 768 && navMenu.classList.contains('open')) {
                toggleNav();
            }
        });
    });

    // 根据滚动位置更新导航激活状态
    const updateNavActive = () => {
        const sections = qsa('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    // 滚动时更新导航状态
    let lastScroll = 0;
    let scrollTimeout;
    
    const updateNavOnScroll = () => {
        const y = window.scrollY;
        
        // 更新导航栏背景和隐藏
        if (navbar) {
            navbar.classList.toggle('scrolled', y > 50);
            
            // 滚动方向检测 - 向下滚动隐藏，向上滚动显示
            if (y > lastScroll && y > 100) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScroll = y;
        }
        
        // 更新导航激活状态
        updateNavActive();
    };

    // 节流滚动事件
    on(window, 'scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                updateNavOnScroll();
                scrollTimeout = null;
            }, 16);
        }
    });

    // 滚动进度条
    const scrollProgress = qs('#scrollProgress');
    if (scrollProgress) {
        on(window, 'scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollProgress.style.width = scrolled + '%';
        });
    }

    // 回到顶部按钮
    const backToTop = qs('#backToTop');
    if (backToTop) {
        on(window, 'scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        on(backToTop, 'click', () => {
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        });
    }

    // 自定义光标
    const cursorDot = qs('#cursorDot');
    const cursorOutline = qs('#cursorOutline');
    if (!isTouch && cursorDot && cursorOutline) {
        cursorDot.style.display = cursorOutline.style.display = 'block';
        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        const speed = 0.15;

        on(document, 'mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        const loop = () => {
            outlineX += (mouseX - outlineX) * speed;
            outlineY += (mouseY - outlineY) * speed;
            cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
            requestAnimationFrame(loop);
        };
        loop();

        // 鼠标点击效果
        ['mousedown', 'touchstart'].forEach(ev => on(document, ev, () => {
            cursorDot.classList.add('active');
            cursorOutline.classList.add('active');
        }));
        
        ['mouseup', 'touchend'].forEach(ev => on(document, ev, () => {
            cursorDot.classList.remove('active');
            cursorOutline.classList.remove('active');
        }));
        
        // 悬停交互元素时的光标变化
        const interactiveElements = qsa('a, button, .project-card, .service-card, .gallery-item');
        interactiveElements.forEach(el => {
            on(el, 'mouseenter', () => {
                cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) scale(1.5)`;
                cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1.5)`;
            });
            on(el, 'mouseleave', () => {
                cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) scale(1)`;
                cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
            });
        });
    } else if (cursorDot && cursorOutline) {
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
    }

    // 粒子动画
    const particlesCanvas = qs('#particles-canvas');
    if (particlesCanvas && window.HTMLCanvasElement) {
        const canvas = document.createElement('canvas');
        particlesCanvas.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        
        const resize = () => {
            w = canvas.width = particlesCanvas.clientWidth || window.innerWidth;
            h = canvas.height = particlesCanvas.clientHeight || 500;
        };
        
        const rand = (a, b) => a + Math.random() * (b - a);
        
        const init = (n = Math.round((w * h) / 15000)) => {
            particles = new Array(n).fill(0).map(() => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: rand(1, 3),
                vx: rand(-0.2, 0.2),
                vy: rand(-0.3, 0.1),
                a: rand(0.3, 0.8),
                color: `rgba(${Math.floor(rand(100, 200))}, ${Math.floor(rand(150, 220))}, 255, `,
                connections: []
            }));
        };
        
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 * (1 - distance/120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };
        
        const step = () => {
            ctx.clearRect(0, 0, w, h);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                // 边界处理
                if (p.y < -20) p.y = h + 20;
                if (p.y > h + 20) p.y = -20;
                if (p.x < -20) p.x = w + 20;
                if (p.x > w + 20) p.x = -20;
                
                // 绘制粒子
                ctx.beginPath();
                ctx.fillStyle = `${p.color}${p.a})`;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            
            drawConnections();
            requestAnimationFrame(step);
        };
        
        const onResize = () => { resize(); init(); };
        on(window, 'resize', onResize);
        resize();
        init();
        step();
    }

    // 统计数字动画
    const statNumbers = qsa('.stat-number');
    if (statNumbers.length) {
        const animateNumber = (el) => {
            const target = parseInt(el.getAttribute('data-count') || el.textContent);
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current);
                }
            }, 16);
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(el => observer.observe(el));
    }

    // 修复：移除对视差滚动效果中标题区域的影响
    // 不再对.section-header应用视差效果

    // 滚动动画 - 修复标题错位问题
    const revealEls = qsa('.reveal-animation:not(.section-header):not(.section-subtitle):not(.section-title):not(.section-description):not(.cta-content):not(.contact-form h3)');
    
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // 标题区域不应用滚动动画
        const titleElements = qsa('.section-header, .section-subtitle, .section-title, .section-description, .cta-content, .contact-form h3');
        titleElements.forEach(el => {
            el.classList.remove('reveal-animation');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        
        // 其他元素应用滚动动画
        revealEls.forEach((el, index) => {
            // 为不同元素添加延迟类
            if (index % 2 === 0) el.classList.add('delay-1');
            if (index % 3 === 0) el.classList.add('delay-2');
            if (index % 4 === 0) el.classList.add('delay-3');
            
            el.classList.add('reveal-animation');
            io.observe(el);
        });
    } else {
        revealEls.forEach(el => el.classList.add('in-view'));
    }

    // 画廊模态框
    const imageModal = qs('#image-modal');
    const modalImage = qs('#modalImage');
    const closeImageModal = qs('#closeImageModal');
    const modalPrev = qs('#modalPrev');
    const modalNext = qs('#modalNext');
    const galleryImgs = qsa('.gallery-item img');
    
    let currentImageIndex = 0;
    let galleryImages = [];
    
    if (galleryImgs.length) {
        galleryImages = galleryImgs.map(img => img.src);
        
        const openModal = (index) => {
            if (!imageModal || !modalImage) return;
            currentImageIndex = index;
            modalImage.src = galleryImages[currentImageIndex];
            imageModal.setAttribute('aria-hidden', 'false');
            imageModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('modal-open');
        };
        
        const closeModal = () => {
            if (!imageModal) return;
            imageModal.setAttribute('aria-hidden', 'true');
            imageModal.classList.remove('open');
            document.body.style.overflow = '';
            document.documentElement.classList.remove('modal-open');
        };
        
        const navigateModal = (direction) => {
            currentImageIndex += direction;
            if (currentImageIndex < 0) currentImageIndex = galleryImages.length - 1;
            if (currentImageIndex >= galleryImages.length) currentImageIndex = 0;
            modalImage.src = galleryImages[currentImageIndex];
            
            // 添加过渡动画
            modalImage.style.opacity = '0';
            setTimeout(() => {
                modalImage.style.opacity = '1';
            }, 50);
        };
        
        galleryImgs.forEach((img, index) => {
            on(img.closest('.gallery-item'), 'click', () => openModal(index));
        });
        
        if (closeImageModal) on(closeImageModal, 'click', closeModal);
        if (modalPrev) on(modalPrev, 'click', () => navigateModal(-1));
        if (modalNext) on(modalNext, 'click', () => navigateModal(1));
        
        on(imageModal, 'click', e => {
            if (e.target === imageModal) closeModal();
        });
        
        on(document, 'keydown', e => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') navigateModal(-1);
            if (e.key === 'ArrowRight') navigateModal(1);
        });
    }

    // 媒体资料包下载
    const downloadKitBtn = qs('#downloadKitBtn');
    if (downloadKitBtn) {
        on(downloadKitBtn, 'click', () => {
            const href = 'media/NexusW.R_Media_Kit.zip';
            const a = document.createElement('a');
            a.href = href;
            a.download = href.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // 显示下载成功提示
            const toast = document.createElement('div');
            toast.textContent = '媒体资料包开始下载';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--accent-grad);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 1000;
                animation: fadeInOut 3s ease-in-out;
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 3000);
        });
    }

    // 联系表单
    const sendContactBtn = qs('#sendContactBtn');
    if (sendContactBtn) {
        on(sendContactBtn, 'click', () => {
            const name = (qs('#contactName') || {}).value || '';
            const email = (qs('#contactEmail') || {}).value || '';
            const projectType = (qs('#projectType') || {}).value || '';
            const message = (qs('#contactMessage') || {}).value || '';
            
            if (!name || !email || !projectType) {
                // 显示错误提示
                const toast = document.createElement('div');
                toast.textContent = '请填写姓名、邮箱和合作类型';
                toast.style.cssText = `
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ef4444;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    z-index: 1000;
                    animation: fadeInOut 3s ease-in-out;
                `;
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 3000);
                return;
            }
            
            const to = '1421646141@qq.com';
            const subject = `[合作咨询] ${projectType} - ${name}`;
            const body = `姓名/工作室: ${name}\n邮箱: ${email}\n合作类型: ${projectType}\n\n项目描述:\n${message}\n\n---\n来自 NexusW.R 网站合作咨询表单`;
            
            window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // 显示成功提示
            const toast = document.createElement('div');
            toast.textContent = '正在打开邮件客户端...';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--accent-grad);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 1000;
                animation: fadeInOut 3s ease-in-out;
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 3000);
        });
    }

    // 页面加载完成
    window.addEventListener('load', () => {
        document.documentElement.classList.remove('is-loading');
        document.documentElement.classList.add('is-loaded');
        
        // 初始化滚动
        updateNavOnScroll();
        updateNavActive();
        
        // 添加 CSS 类用于动画
        setTimeout(() => {
            document.body.classList.add('page-ready');
            
            // 添加淡入动画到所有内容
            const contentElements = qsa('.hero-content > *');
            contentElements.forEach((el, index) => {
                el.style.animationDelay = `${0.3 + (index * 0.1)}s`;
            });
        }, 100);
        
        // 添加悬浮卡片动画延迟
        const floatingCards = qsa('.floating-card');
        floatingCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.5}s`;
        });
        
        // 确保标题区域有足够间距
        const sectionHeaders = qsa('.section-header');
        sectionHeaders.forEach(header => {
            header.style.marginBottom = '60px';
        });
        
        // 修复：确保所有标题元素都没有transform影响
        const titleElements = qsa('.section-header, .section-subtitle, .section-title, .section-description, .cta-content h2, .cta-content p, .contact-form h3');
        titleElements.forEach(el => {
            el.style.transform = 'none';
            el.style.opacity = '1';
        });
    });

    // ESC 键关闭导航和模态框
    on(document, 'keydown', (e) => {
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('open')) toggleNav();
            if (imageModal && imageModal.classList.contains('open')) {
                imageModal.setAttribute('aria-hidden', 'true');
                imageModal.classList.remove('open');
                document.body.style.overflow = '';
                document.documentElement.classList.remove('modal-open');
            }
        }
    });

    // 鼠标悬停效果
    const interactiveElements = qsa('a, button, .project-card, .service-card, .partner-card, .gallery-item');
    interactiveElements.forEach(el => {
        on(el, 'mouseenter', () => {
            el.classList.add('hover-active');
        });
        on(el, 'mouseleave', () => {
            el.classList.remove('hover-active');
        });
    });

    // 添加CSS动画定义
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        .modal-open {
            overflow: hidden;
        }
        
        /* 修复：确保标题不会重叠 */
        .section-title,
        .section-subtitle,
        .section-description {
            position: relative;
            z-index: 1;
        }
        
        /* 修复：为小屏幕优化标题间距 */
        @media (max-width: 768px) {
            .section-header {
                margin-bottom: 40px !important;
            }
            
            .section-title {
                font-size: 32px !important;
            }
        }
        
        /* 修复：为超小屏幕进一步优化 */
        @media (max-width: 480px) {
            .section-header {
                margin-bottom: 30px !important;
            }
            
            .section-title {
                font-size: 28px !important;
            }
        }
    `;
    document.head.appendChild(style);

})();

// 在index.js中添加以下代码

// 图片背景预加载和视差效果
const heroBgImage = qs('.hero-bg-image img');
if (heroBgImage) {
    // 预加载图片
    const img = new Image();
    img.src = heroBgImage.src;
    img.onload = () => {
        heroBgImage.classList.add('loaded');
        heroBgImage.style.opacity = '1';
    };
    
    // 添加加载动画
    heroBgImage.style.opacity = '0';
    heroBgImage.style.transition = 'opacity 1.2s ease-out, transform 8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    
    // 视差滚动效果（可选）
    if (!isTouch) {
        on(window, 'scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            heroBgImage.style.transform = `scale(1.1) translateY(${rate}px)`;
        });
    }
    
    // 鼠标移动视差效果（可选）
    on(document, 'mousemove', (e) => {
        if (isTouch) return;
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        
        heroBgImage.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
    });
}