document.addEventListener("DOMContentLoaded", () => {
    // 1. 初始化 Lenis 平滑滚动
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        direction: 'vertical',
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. 注册 GSAP
    gsap.registerPlugin(ScrollTrigger);

    // --- 旧功能逻辑保留与适配 ---

    // 倒计时逻辑
    function initCountdown() {
        const el = document.getElementById('release-countdown');
        if (!el) return;
        const releaseDate = new Date('2026-08-01').getTime();
        
        function update() {
            const now = new Date().getTime();
            const left = releaseDate - now;
            if (left < 0) {
                el.innerText = "STATUS: RELEASED";
                return;
            }
            const d = Math.floor(left / (1000 * 60 * 60 * 24));
            const h = Math.floor((left % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            el.innerText = `T-MINUS: ${d}D ${h}H`;
        }
        update();
        setInterval(update, 60000);
    }
    initCountdown();

    // 粒子背景 (保留原有canvas逻辑，调整颜色为蓝色系)
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize);
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2; // 小一点，像数据点
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                // 改为青蓝色
                this.color = `rgba(0, 243, 255, ${Math.random() * 0.5})`;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if(this.x > canvas.width) this.x=0; if(this.x<0) this.x=canvas.width;
                if(this.y > canvas.height) this.y=0; if(this.y<0) this.y=canvas.height;
            }
            draw() {
                ctx.fillStyle = this.color; ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
            }
        }
        
        for(let i=0; i<80; i++) particles.push(new Particle()); // 减少数量，更干净
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    }
    initParticles();

    // 兑换码逻辑 (保留文件读取)
    const redeemInput = document.getElementById('redeem-code');
    const redeemBtn = document.getElementById('redeem-submit');
    const modal = document.getElementById('redeem-modal');
    const closeBtn = document.querySelector('.close');
    let validCodes = [];

    // 模拟读取文件 (实际环境需确保文件路径正确)
    fetch('兑换码.txt')
        .then(res => res.ok ? res.text() : "")
        .then(data => {
            validCodes = data.split('\n').map(c => c.trim()).filter(c => c);
            console.log("Codes Loaded");
        })
        .catch(() => console.log("Code file not found, using fallback or empty."));

    if (redeemBtn) {
        redeemBtn.addEventListener('click', () => {
            const val = redeemInput.value.trim();
            if(!val) return alert("INPUT REQUIRED");
            
            // 简单模拟验证成功，因为本地无法读取txt
            // 实际使用时请取消注释下面的判断
            // if(validCodes.includes(val)) {
            if(val.length > 0) { // 测试用：只要输入了就成功
                modal.style.display = 'flex';
            } else {
                alert("ACCESS DENIED");
            }
        });
    }
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };

    // --- 新增动画逻辑 ---

    // 轮播图逻辑 (改为背景切换)
    const slides = document.querySelectorAll('.hero-slider-bg .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let curSlide = 0;
    
    function setSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        curSlide = index;
    }
    setInterval(() => {
        setSlide((curSlide + 1) % slides.length);
    }, 5000);
    dots.forEach((d, i) => d.onclick = () => setSlide(i));

    // 文字乱码解码特效
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\#";
    document.querySelectorAll(".decode-text").forEach(el => {
        const text = el.innerText;
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => {
                let iter = 0;
                const interval = setInterval(() => {
                    el.innerText = text.split("").map((l, i) => {
                        if (i < iter) return text[i];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join("");
                    if (iter >= text.length) clearInterval(interval);
                    iter += 1/3;
                }, 30);
            }
        });
    });

    // 进场动画
    const tl = gsap.timeline();
    tl.from(".line-mask span", { yPercent: 100, duration: 1, stagger: 0.1, ease: "power4.out" })
      .from(".hero-subtitle", { opacity: 0, x: -20, duration: 0.5 })
      .from(".hero-buttons", { opacity: 0, y: 20, duration: 0.5 });

    // 扫描进场 (类似上一版 ROG)
    const animTriggers = document.querySelectorAll(".project-anim-trigger");
    animTriggers.forEach(card => {
        const mask = card.querySelector(".scan-mask");
        const img = card.querySelector("img");
        
        const t = gsap.timeline({
            scrollTrigger: { trigger: card, start: "top 75%" }
        });
        t.to(card, {opacity: 1, duration: 0.1})
         .fromTo(mask, {scaleX: 0}, {scaleX: 1, duration: 0.4})
         .to(mask, {scaleX: 0, transformOrigin: "right", duration: 0.4})
         .from(img, {scale: 1.2, opacity: 0.5, duration: 1}, "-=0.4");
    });

    // 自定义光标
    const cursor = document.getElementById("cursor");
    const follower = document.getElementById("cursorFollower");
    if (window.matchMedia("(pointer: fine)").matches) {
        let mx=0, my=0, fx=0, fy=0;
        document.addEventListener("mousemove", e => { mx=e.clientX; my=e.clientY; gsap.set(cursor, {x:mx, y:my}); });
        gsap.ticker.add(() => {
            fx += (mx - fx) * 0.15; fy += (my - fy) * 0.15;
            gsap.set(follower, {x:fx, y:fy});
        });
        document.querySelectorAll("a, button, .gallery-item-rog, .info-card-rog").forEach(el => {
            el.onmouseenter = () => document.body.classList.add("hover-active");
            el.onmouseleave = () => document.body.classList.remove("hover-active");
        });
    }

    // 预告片按钮滚动
    document.getElementById('trailer-btn').onclick = () => {
        lenis.scrollTo('#video');
    };
    
    // 图片放大
    const imgModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    document.querySelectorAll('.image-zoom').forEach(el => {
        el.onclick = () => {
            const src = el.querySelector('img').src;
            modalImg.src = src;
            imgModal.style.display = 'flex';
        }
    });
    document.querySelector('.close-modal').onclick = () => imgModal.style.display = 'none';
    imgModal.onclick = (e) => { if(e.target === imgModal) imgModal.style.display = 'none'; }

    // HUD 进度条更新
    window.addEventListener("scroll", () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const p = (window.scrollY / total) * 100;
        document.querySelector(".rog-scroll-progress").style.height = `${p}%`;
    });
    
    // 移动端菜单
    const ham = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-menu');
    ham.onclick = () => {
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        // 简单切换，实际建议加class控制CSS
        if(menu.style.display === 'flex') {
            menu.style.position = 'absolute';
            menu.style.top = '100%';
            menu.style.left = '0';
            menu.style.width = '100%';
            menu.style.background = 'rgba(0,0,0,0.9)';
            menu.style.flexDirection = 'column';
            menu.style.padding = '20px';
        }
    };
});