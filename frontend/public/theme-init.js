(function () {
  try {
    const cachedTheme = localStorage.getItem('theme-preference') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(cachedTheme);
  } catch (error) {
    console.error(error);
  }
})();

