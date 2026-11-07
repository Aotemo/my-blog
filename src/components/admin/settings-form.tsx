"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none transition focus:border-[var(--accent)]";

const textareaClass =
  "w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]";

type Feedback = { type: "idle" | "success" | "error"; message?: string };

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    siteTitle: initial.siteTitle,
    siteDescription: initial.siteDescription,
    authorName: initial.authorName,
    authorBio: initial.authorBio,
    avatarUrl: initial.avatarUrl ?? "",
    githubUrl: initial.githubUrl ?? "",
  });
  const [siteFeedback, setSiteFeedback] = useState<Feedback>({ type: "idle" });
  const [savingSite, setSavingSite] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>({ type: "idle" });
  const [savingPassword, setSavingPassword] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveSite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSite(true);
    setSiteFeedback({ type: "idle" });
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          avatarUrl: form.avatarUrl.trim() || null,
          githubUrl: form.githubUrl.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setSiteFeedback({ type: "error", message: payload?.error ?? "保存失败" });
        return;
      }
      setSiteFeedback({ type: "success", message: "站点信息已保存" });
      router.refresh();
    } catch {
      setSiteFeedback({ type: "error", message: "网络异常，请稍后再试" });
    } finally {
      setSavingSite(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordFeedback({ type: "idle" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", message: "两次输入的新密码不一致" });
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setPasswordFeedback({ type: "error", message: payload?.error ?? "修改失败" });
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFeedback({ type: "success", message: "密码已更新，下次登录请使用新密码" });
    } catch {
      setPasswordFeedback({ type: "error", message: "网络异常，请稍后再试" });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveSite} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">站点信息</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="siteTitle" className="mb-1.5 block text-sm font-medium">
              站点标题
            </label>
            <input
              id="siteTitle"
              value={form.siteTitle}
              onChange={(event) => update("siteTitle", event.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="authorName" className="mb-1.5 block text-sm font-medium">
              作者名称
            </label>
            <input
              id="authorName"
              value={form.authorName}
              onChange={(event) => update("authorName", event.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="siteDescription" className="mb-1.5 block text-sm font-medium">
            站点描述
          </label>
          <input
            id="siteDescription"
            value={form.siteDescription}
            onChange={(event) => update("siteDescription", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="authorBio" className="mb-1.5 block text-sm font-medium">
            作者简介
          </label>
          <textarea
            id="authorBio"
            value={form.authorBio}
            onChange={(event) => update("authorBio", event.target.value)}
            rows={4}
            className={textareaClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="avatarUrl" className="mb-1.5 block text-sm font-medium">
              头像 URL
            </label>
            <input
              id="avatarUrl"
              value={form.avatarUrl}
              onChange={(event) => update("avatarUrl", event.target.value)}
              className={inputClass}
              placeholder="/uploads/avatar.png 或 https://…"
            />
          </div>
          <div>
            <label htmlFor="githubUrl" className="mb-1.5 block text-sm font-medium">
              GitHub URL
            </label>
            <input
              id="githubUrl"
              value={form.githubUrl}
              onChange={(event) => update("githubUrl", event.target.value)}
              className={inputClass}
              placeholder="https://github.com/…"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingSite}
            className="inline-flex h-10 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {savingSite ? "保存中…" : "保存站点信息"}
          </button>
          {siteFeedback.message && (
            <p
              className={`text-sm ${
                siteFeedback.type === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {siteFeedback.message}
            </p>
          )}
        </div>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <div>
          <h2 className="text-sm font-semibold">修改管理员密码</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">新密码至少 6 位</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium">
              当前密码
            </label>
            <input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium">
              新密码
            </label>
            <input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
              确认新密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
          >
            {savingPassword ? "提交中…" : "修改密码"}
          </button>
          {passwordFeedback.message && (
            <p
              className={`text-sm ${
                passwordFeedback.type === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {passwordFeedback.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
