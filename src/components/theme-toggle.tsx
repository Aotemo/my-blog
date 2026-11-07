"use client";

import { useEffect, useState } from "react";
import { PixelMoon, PixelSun } from "./pixel-icons";
import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // 忽略存储失败（隐私模式等）
    }
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      className={`pixel-btn h-8 w-8 p-0 ${className}`}
    >
      {mounted && isDark ? (
        <PixelSun className="h-3.5 w-3.5" />
      ) : (
        <PixelMoon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
