import Link from "next/link";
import { PixelSprite } from "@/components/pixel-icons";
import { ThemeSync } from "@/components/theme-sync";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <ThemeSync />
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>

      <PixelSprite className="h-12 w-12 text-[var(--accent)]" />

      <p className="mt-8 font-pixel text-[clamp(28px,9vw,60px)] leading-none text-[var(--accent-2)]">
        GAME OVER
      </p>

      <div className="pixel-divider mt-7 w-40" aria-hidden />

      <h1 className="mt-7 text-xl font-bold tracking-tight">页面不存在</h1>
      <p className="mt-2 max-w-sm text-sm leading-[1.8] text-[var(--muted)]">
        这个关卡不存在，或者已经被删除、移动。
      </p>

      <Link
        href="/"
        className="pixel-btn pixel-btn-primary mt-10 h-12 px-6 font-pixel text-[10px] leading-none"
      >
        &gt; PRESS START
      </Link>
      <p className="mt-3 font-pixel text-[8px] leading-none text-[var(--muted)]">TO GO HOME</p>
    </div>
  );
}
