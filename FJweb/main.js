document.addEventListener('DOMContentLoaded', function() {
    // 隐藏加载动画
    window.addEventListener('load', function() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.visibility = 'hidden';
        }
        
        // 初始化所有动画
        setTimeout(initAnimations, 500);
    });

    // 鼠标跟随效果
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
        let mouseX = 0, mouseY = 0;
        const updateCursor = () => {
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            cursorOutline.animate({
                left: `${mouseX}px`,
                top: `${mouseY}px`
            }, { duration: 500, fill: "forwards" });
        };
        
        window.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            requestAnimationFrame(updateCursor);
        });
        
        // 鼠标悬停交互效果
        const hoverElements = document.querySelectorAll('a, button, .card-hover, .member-hover, .image-zoom');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.style.transform = 'scale(2)';
                cursorOutline.style.transform = 'scale(1.5)';
                cursorOutline.style.borderColor = 'rgba(106, 17, 203, 0.8)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorDot.style.transform = 'scale(1)';
                cursorOutline.style.transform = 'scale(1)';
                cursorOutline.style.borderColor = 'rgba(106, 17, 203, 0.5)';
            });
        });
    }

    // 粒子背景
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        // 设置canvas尺寸
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 创建粒子
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = `rgba(${Math.floor(Math.random() * 100 + 106)}, 
                    ${Math.floor(Math.random() * 50 + 17)}, 
                    ${Math.floor(Math.random() * 100 + 203)}, 
                    ${Math.random() * 0.5 + 0.1})`;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 初始化粒子
        function initParticlesArray() {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        initParticlesArray();
        
        // 绘制连接线
        function connectParticles() {
            const maxDistance = 100;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < maxDistance) {
                        ctx.strokeStyle = `rgba(106, 17, 203, ${0.2 * (1 - distance / maxDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // 动画循环
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            connectParticles();
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
    }
    
    initParticles();

    // 返回顶部按钮
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        const toggleBackToTop = () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };
        
        window.addEventListener('scroll', () => requestAnimationFrame(toggleBackToTop));
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 轮播图功能增强
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const progressBar = document.querySelector('.progress-bar');
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;

    // 初始化轮播
    function initSlider() {
        if (slides.length === 0) return;
        
        // 显示第一张幻灯片
        slides[0].classList.add('active');
        dots[0].classList.add('active');
        updateProgressBar();
        
        // 设置自动轮播
        slideInterval = setInterval(nextSlide, 5000);
    }

    // 切换到下一张幻灯片
    function nextSlide() {
        if (isTransitioning) return;
        goToSlide((currentSlide + 1) % slides.length);
    }

    // 切换到上一张幻灯片
    function prevSlide() {
        if (isTransitioning) return;
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    // 跳转到指定幻灯片
    function goToSlide(n) {
        isTransitioning = true;
        
        // 淡出当前幻灯片
        slides[currentSlide].style.opacity = '0';
        dots[currentSlide].classList.remove('active');
        
        setTimeout(() => {
            slides[currentSlide].classList.remove('active');
            slides[currentSlide].style.opacity = '';
            
            currentSlide = n;
            
            // 淡入新幻灯片
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
            updateProgressBar();
            
            setTimeout(() => {
                isTransitioning = false;
            }, 300);
        }, 300);
    }

    // 更新进度条
    function updateProgressBar() {
        if (progressBar) {
            progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
        }
    }

    // 事件监听
    if (prevBtn) prevBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        prevSlide();
        slideInterval = setInterval(nextSlide, 5000);
    });
    
    if (nextBtn) nextBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        nextSlide();
        slideInterval = setInterval(nextSlide, 5000);
    });
    
    // 为每个点添加点击事件
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(index);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
    
    // 初始化轮播
    initSlider();

    // 导航栏滚动效果增强
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 移动端菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 点击导航链接关闭菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 按钮点击效果增强
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // 添加涟漪效果
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加涟漪动画CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 表单提交
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 添加提交成功动画
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> 已发送';
            submitBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                alert('感谢您的留言！我们会尽快与您联系。');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 1500);
        });
    }

    // 图片放大功能
    const galleryItems = document.querySelectorAll('.gallery-item');
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            modalImg.src = imgSrc;
            imageModal.style.display = 'flex';
            imageModal.setAttribute('aria-hidden', 'false');
        });
    });
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            imageModal.style.display = 'none';
            imageModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
            imageModal.setAttribute('aria-hidden', 'true');
        }
    });

    // 发行日期倒计时
    function initCountdown() {
        const countdownElement = document.getElementById('release-countdown');
        if (!countdownElement) return;
        
        const releaseDate = new Date('2026-08-01').getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const timeLeft = releaseDate - now;
            
            if (timeLeft < 0) {
                countdownElement.textContent = '已发布！';
                return;
            }
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            countdownElement.textContent = `剩余: ${days}天 ${hours}小时 ${minutes}分`;
        }
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // 每分钟更新一次
    }
    
    initCountdown();

    // 滚动触发动画
    function initScrollAnimations() {
        const revealElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
        
        function checkScroll() {
            const windowHeight = window.innerHeight;
            const revealPoint = 150;
            
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                
                if (elementTop < windowHeight - revealPoint) {
                    element.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', () => requestAnimationFrame(checkScroll));
        checkScroll(); // 初始检查
    }
    
    // 初始化所有动画
    function initAnimations() {
        initScrollAnimations();
        
        // 为所有动态元素添加动画延迟
        const animatedElements = document.querySelectorAll('.fade-in-up, .card-hover, .member-hover');
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // 兑换码验证功能增强
    const redeemInput = document.getElementById('redeem-code');
    const redeemSubmit = document.getElementById('redeem-submit');
    const modal = document.getElementById('redeem-modal');
    const closeBtn = document.querySelector('.close');
    let validCodes = [];
    
    
    // 加载兑换码文件
    function loadRedeemCodes() {
        const filePaths = [
            '兑换码.txt',
            './兑换码.txt',
            'duihuanma.txt'
        ];
        
        function tryLoad(pathIndex) {
            if (pathIndex >= filePaths.length) {
                console.warn('所有兑换码文件加载失败');
                return;
            }
            
            const filePath = filePaths[pathIndex];
            console.log(`尝试加载兑换码文件: ${filePath}`);
            
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    validCodes = data.split('\n')
                        .map(code => code.trim())
                        .filter(code => code !== '');
                    
                    console.log(`成功从 ${filePath} 加载 ${validCodes.length} 个兑换码`);
                })
                .catch(error => {
                    console.warn(`加载 ${filePath} 失败:`, error);
                    tryLoad(pathIndex + 1);
                });
        }
        
        tryLoad(0);
    }
    
    // 初始化加载兑换码
    loadRedeemCodes();
    
    // 提交兑换码
    if (redeemSubmit) {
        redeemSubmit.addEventListener('click', function() {
            const inputCode = redeemInput.value.trim();
            
            if (!inputCode) {
                showNotification('请输入兑换码', 'warning');
                redeemInput.focus();
                return;
            }
            
            if (validCodes.length === 0) {
                showNotification('系统正在加载兑换码数据，请稍后重试', 'warning');
                return;
            }
            
            // 添加加载效果
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 验证中...';
            this.disabled = true;
            
            // 模拟网络延迟
            setTimeout(() => {
                if (validCodes.includes(inputCode)) {
                    // 兑换成功
                    modal.style.display = 'block';
                    modal.setAttribute('aria-hidden', 'false');
                    redeemInput.value = '';
                    showNotification('兑换成功！', 'success');
                    console.log(`兑换码 "${inputCode}" 兑换成功`);
                    
                } else {
                    showNotification('兑换码无效，请检查后重试', 'error');
                }
                
                // 恢复按钮状态
                this.innerHTML = originalText;
                this.disabled = false;
            }, 800);
        });
    }
    
    // 关闭弹窗
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });
    }
    
    // 点击弹窗外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });
    
    // 按回车键提交
    if (redeemInput) {
        redeemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                redeemSubmit.click();
            }
        });
    }
    
    // 通知系统
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // 添加动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 移除通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // 预告片按钮
    const trailerBtn = document.getElementById('trailer-btn');
    if (trailerBtn) {
        trailerBtn.addEventListener('click', function() {
            // 滚动到视频部分
            document.querySelector('#video').scrollIntoView({
                behavior: 'smooth'
            });
            
            // 自动播放视频（如果允许）
            setTimeout(() => {
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }
            }, 1000);
        });
    }
    
    // 了解更多按钮
    const learnMoreBtn = document.querySelector('.learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // 可以在这里添加跳转到更多详细信息的链接
            // 暂时显示一个提示
            showNotification('更多详细信息即将上线，敬请期待！', 'info');
        });
    }
    
    // 图片悬停效果
    const imageZoomElements = document.querySelectorAll('.image-zoom');
    imageZoomElements.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// 页面间平滑过渡
document.addEventListener('DOMContentLoaded', function() {
    // 为所有导航链接添加过渡效果
    const navLinks = document.querySelectorAll('a[href^="agreements.html"], a[href^="index.html"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 如果是外部链接或带有target="_blank"的链接，不处理
            if (this.target === '_blank' || 
                this.href.includes('http') && !this.href.includes(window.location.hostname)) {
                return;
            }
            
            // 如果是hash链接（同一页面锚点），不处理
            if (this.getAttribute('href').startsWith('#')) {
                return;
            }
            
            e.preventDefault();
            
            // 创建页面过渡效果
            const transition = document.createElement('div');
            transition.className = 'page-transition';
            transition.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner-circle"></div>
                    <div class="spinner-text">加载中...</div>
                </div>
            `;
            
            document.body.appendChild(transition);
            
            // 延迟后跳转
            setTimeout(() => {
                window.location.href = this.href;
            }, 800);
        });
    });
    
    // 移除页面加载时的过渡效果（如果存在）
    setTimeout(() => {
        const transitions = document.querySelectorAll('.page-transition');
        transitions.forEach(transition => {
            transition.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                transition.remove();
            }, 500);
        });
    }, 1000);
});

// 页面加载进度模拟
window.addEventListener('load', function() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width += 10;
                progressBar.style.width = width + '%';
            }
        }, 50);
    }
});