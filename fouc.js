(function() {
    try {
        const settings = JSON.parse(localStorage.getItem('tdL_settings'));
        if (settings && settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        } else {
            // Default to dark
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();
