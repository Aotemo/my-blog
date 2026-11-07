"use client";

import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * 404 / notFound 由 Next 的错误壳渲染，根布局里的内联主题脚本不会执行，
 * 这里在客户端补一次，保证暗色模式在 404 页同样生效。
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = stored ? stored === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // 忽略存储或媒体查询失败
    }
  }, []);

  return null;
}
