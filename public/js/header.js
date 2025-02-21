document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    const overlay = document.querySelector('.overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    let lastScroll = 0;
    let isMenuOpen = false;

    // Menüyü aç/kapa
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        hamburger?.classList.toggle('active');
        nav?.classList.toggle('active');
        overlay?.classList.toggle('active');
        document.body.classList.toggle('menu-open');

        // Menü açıkken scroll'u engelle
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
    }

    // Event Listeners
    hamburger?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
    });

    overlay?.addEventListener('click', (e) => {
        e.preventDefault();
        if (isMenuOpen) toggleMenu();
    });

    // ESC tuşu ile menüyü kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Nav linklerine tıklandığında menüyü kapat
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });

    // Touch olayları için swipe desteği
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeLength = touchEndX - touchStartX;

        // Sağdan sola swipe ile menüyü aç
        if (Math.abs(swipeLength) > swipeThreshold) {
            if (swipeLength < 0 && !isMenuOpen) {
                toggleMenu();
            }
            // Soldan sağa swipe ile menüyü kapat
            else if (swipeLength > 0 && isMenuOpen) {
                toggleMenu();
            }
        }
    }

    // Scroll olayını yönet
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!isMenuOpen) {
            const currentScroll = window.pageYOffset;

            // Scroll throttling
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    // Yukarı/aşağı scroll tespiti
                    if (currentScroll > lastScroll && currentScroll > 100) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }

                    // Scroll class'ını ekle/kaldır
                    if (currentScroll > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }

                    lastScroll = currentScroll;
                    scrollTimeout = null;
                }, 100);
            }
        }
    }, { passive: true });

    // Sayfa yüklendiğinde aktif menü öğesini işaretle
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setActiveNavItem();
}); 