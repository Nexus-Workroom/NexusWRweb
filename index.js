document.addEventListener("DOMContentLoaded", () => {
    // 1. 初始化 Lenis (平滑滚动)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. 注册 GSAP
    gsap.registerPlugin(ScrollTrigger);

    // 3. 随机字符解码特效 (Scramble Text)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    document.querySelectorAll(".decode-text").forEach(el => {
        const originalText = el.innerText;
        el.addEventListener("mouseenter", () => {
            let iterations = 0;
            const interval = setInterval(() => {
                el.innerText = originalText.split("")
                    .map((char, index) => {
                        if(index < iterations) return originalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join("");
                if(iterations >= originalText.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 30);
        });
        // 初始触发一次
        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            onEnter: () => el.dispatchEvent(new Event('mouseenter'))
        });
    });

    // 4. Hero 区域进场
    const tlHero = gsap.timeline();
    tlHero.from(".line-mask > span", { yPercent: 100, duration: 1, stagger: 0.1, ease: "power4.out" })
          .from(".cyber-badge", { scaleX: 0, opacity: 0, duration: 0.5 }, "-=0.5")
          .from(".hero-desc", { opacity: 0, x: -20, duration: 0.8 }, "-=0.4")
          .from(".hero-btns", { opacity: 0, y: 20, duration: 0.6 }, "-=0.6");

    // 视差背景
    gsap.to(".hero-bg", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        yPercent: 20,
        scale: 1.1,
        ease: "none"
    });

    // 5. 项目卡片 "扫描进场" 动画 (优化版)
    const projectCards = document.querySelectorAll(".project-anim-trigger");
    projectCards.forEach((card, i) => {
        const visual = card.querySelector(".card-visual");
        const mask = card.querySelector(".scan-mask");
        const content = card.querySelector(".card-content");
        const isEven = i % 2 === 0;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        tl.to(card, { opacity: 1, duration: 0.1 })
          .fromTo(mask, 
              { scaleX: 0 }, 
              { scaleX: 1, duration: 0.4, ease: "power2.inOut" })
          .set(visual, { opacity: 1 }) // 确保图片可见
          .to(mask, 
              { scaleX: 0, transformOrigin: "right", duration: 0.4, ease: "power2.inOut" })
          .from(visual.querySelector("img"), 
              { scale: 1.2, duration: 1.5, ease: "power2.out" }, "-=0.8")
          .from(content, 
              { x: isEven ? 50 : -50, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6");
    });

    // 6. 作品展示 (Gallery) 瀑布流进场
    gsap.utils.toArray(".gallery-item").forEach((item, i) => {
        gsap.fromTo(item, 
            { opacity: 0, y: 50 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: "power3.out"
            }
        );
    });

    // 7. 合作伙伴跑马灯
    gsap.to(".marquee-content", {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: "linear"
    });

    // 8. 鼠标跟随逻辑 (ROG 准星风格)
    const cursor = document.getElementById("cursor");
    const follower = document.getElementById("cursorFollower");
    
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // 核心点直接跟随
            gsap.set(cursor, { x: mouseX, y: mouseY });
        });

        // 跟随者带惯性
        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(follower, { x: followerX, y: followerY });
        });

        // 交互状态
        const targets = document.querySelectorAll("a, button, .rog-card, .gallery-item, .service-box");
        targets.forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("hover-active"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("hover-active"));
        });
    }

    // 9. 进度条更新
    window.addEventListener("scroll", () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        document.querySelector(".rog-scroll-progress").style.height = `${progress}%`;
    });

    // 年份
    document.getElementById("year").textContent = new Date().getFullYear();
});