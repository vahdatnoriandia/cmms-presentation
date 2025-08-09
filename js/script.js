document.addEventListener('DOMContentLoaded', () => {
    const slideList = document.getElementById('slide-list');
    const content = document.getElementById('content');
    const slideCount = 19; // تعداد کل اسلایدها

    // ایجاد لیست اسلایدها با عناوین
    for (let i = 1; i <= slideCount; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-slide="${i}">در حال بارگذاری...</a>`;
        slideList.appendChild(li);
        
        // بارگذاری عنوان هر اسلاید
        fetch(`slides/slide${i}.html`)
            .then(response => response.text())
            .then(html => {
                // استخراج عنوان از تگ <title>
                const titleMatch = html.match(/<title>(.*?)<\/title>/);
                const title = titleMatch ? titleMatch[1] : `اسلاید ${i}`;
                const link = li.querySelector('a');
                link.textContent = title;
            })
            .catch(() => {
                li.querySelector('a').textContent = `اسلاید ${i}`;
            });
    }

    // بارگذاری اسلاید اول به صورت پیش‌فرض
    loadSlide(1);
    document.querySelector('.sidebar a').classList.add('active');

    // افزودن رویداد کلیک به لینک‌ها
    slideList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const slideNumber = e.target.getAttribute('data-slide');
            loadSlide(slideNumber);
            
            // حذف کلاس active از همه لینک‌ها
            document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
            // افزودن کلاس active به لینک فعلی
            e.target.classList.add('active');
        }
    });

    // پشتیبانی از کلیدهای جهت‌دار
    document.addEventListener('keydown', (e) => {
        const activeLink = document.querySelector('.sidebar a.active');
        if (!activeLink) return;
        
        const currentSlide = parseInt(activeLink.getAttribute('data-slide'));
        
        if (e.key === 'ArrowRight' && currentSlide < slideCount) {
            loadSlide(currentSlide + 1);
            activeLink.classList.remove('active');
            document.querySelector(`[data-slide="${currentSlide + 1}"]`).classList.add('active');
        } 
        else if (e.key === 'ArrowLeft' && currentSlide > 1) {
            loadSlide(currentSlide - 1);
            activeLink.classList.remove('active');
            document.querySelector(`[data-slide="${currentSlide - 1}"]`).classList.add('active');
        }
    });

    // تابع بارگذاری اسلاید با iframe
    function loadSlide(slideNumber) {
        // ایجاد کانتینر اسلاید
        content.innerHTML = `
            <div class="slide-container">
                <iframe 
                    class="slide-iframe" 
                    src="slides/slide${slideNumber}.html" 
                    frameborder="0" 
                    allowfullscreen
                ></iframe>
            </div>
        `;
        
        // تنظیم ارتفاع iframe پس از بارگذاری
        const iframe = content.querySelector('.slide-iframe');
        iframe.onload = function() {
            try {
                // تلاش برای تنظیم ارتفاع iframe بر اساس محتوای داخلی
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const slideElement = iframeDoc.querySelector('.slide');
                
                if (slideElement) {
                    // اگر اسلاید کلاس slide دارد، ارتفاع آن را می‌گیریم
                    const slideHeight = slideElement.scrollHeight;
                    iframe.style.height = slideHeight + 'px';
                } else {
                    // در غیر این صورت، ارتفاع کل سند را می‌گیریم
                    iframe.style.height = iframeDoc.body.scrollHeight + 'px';
                }
            } catch (e) {
                // اگر به دلیل خطای Same-Origin Policy نتوانستیم به محتوای iframe دسترسی داشته باشیم
                console.log('Cannot access iframe content due to same-origin policy');
                iframe.style.height = '100vh';
            }
        };
    }
});