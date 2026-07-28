document.addEventListener('DOMContentLoaded', () => {
    
    /* --- Menu Mobile --- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });

    /* --- Mudança Visual do Header ao Rolar --- */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '1rem 0';
            header.style.backgroundColor = 'rgba(12, 12, 12, 0.95)';
        } else {
            header.style.padding = '1.5rem 0';
            header.style.backgroundColor = 'rgba(12, 12, 12, 0.8)';
        }
    });

    /* --- Lightbox do Portfólio --- */
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.getAttribute('data-title');
            const desc = item.getAttribute('data-desc');
            const placeholderContent = item.querySelector('.portfolio-thumb-placeholder').innerText;

            lightboxTitle.innerText = title;
            lightboxDesc.innerText = desc;
            lightboxImg.innerText = placeholderContent; // Substitua por <img> real quando houver imagens

            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
