document.addEventListener('DOMContentLoaded', function() {
    // ヘッダーのスクロール制御
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroVideo = document.querySelector('.hero-video');
    const heroOverlay = document.querySelector('.hero-overlay');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollProgress = scrollTop / (window.innerHeight * 0.5); // 50%スクロールで完全に透明に
        
        // ヘッダーの制御
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // ヒーローセクションの要素の透明度を制御
        if (scrollProgress <= 1) {
            heroVideo.style.opacity = Math.max(0, 1 - scrollProgress);
            heroOverlay.style.opacity = Math.max(0, 1 - scrollProgress);
            heroSubtitle.style.opacity = Math.max(0, 1 - scrollProgress);
            heroSubtitle.style.transform = `translateY(${scrollProgress * 20}px)`;
        }
        
        lastScrollTop = scrollTop;
    });

    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = header.offsetHeight;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(element => {
        fadeInObserver.observe(element);
    });

    // モバイルメニューの制御
    const menuButton = document.querySelector('.menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // モバイルメニューのリンクをクリックしたらメニューを閉じる
        document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuButton.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}); 