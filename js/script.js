document.addEventListener('DOMContentLoaded', function() {
    const imageSlider = document.querySelector('.image-slider');
    const images = imageSlider.querySelectorAll('img');
    const navigationDots = document.querySelector('.navigation-dots');
    const dots = navigationDots.querySelectorAll('.dot');
    const totalImages = images.length;
    let currentIndex = 0;

    function updateSlider() {
        const translateValue = -currentIndex * 100 + '%';
        imageSlider.style.transform = `translateX(${translateValue})`;
        updateNavigationDots();
    }

    function updateNavigationDots() {
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentIndex) {
                dot.classList.add('active');
            }
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentIndex = index;
            updateSlider();
        });
    });

    // Inisialisasi slider
    updateSlider();
});
