import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function unauthorized(message = "未登录或登录已过期") {
  return jsonError(message, 401);
}

export function notFound(message = "资源不存在") {
  return jsonError(message, 404);
}

export function zodErrorMessage(error: ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "参数校验失败";
}

export { slugify, slugifyName } from "./slug";
