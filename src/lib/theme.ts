export const THEME_STORAGE_KEY = "blog-theme";

export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("blog-theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;if(s==="dark"||(!s&&m)){document.documentElement.classList.add("dark");}}catch(e){}})();`;
