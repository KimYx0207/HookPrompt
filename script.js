// 老金个人主页 - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('老金的个人主页加载完成！');
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
