"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-3 border-b-2 border-dashed border-[var(--border)] pb-2 font-pixel text-[8px] leading-none text-[var(--muted)]">
        ON THIS PAGE
      </p>
      <ul className="space-y-2 text-[13px] leading-snug">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={`pixel-link block px-1 py-0.5 ${
                activeId === item.id
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {activeId === item.id && <span className="mr-1 text-[var(--accent-2)]">&gt;</span>}
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
