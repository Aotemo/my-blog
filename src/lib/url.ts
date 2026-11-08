type RequestLike = {
  url: string;
  headers: Headers;
};

function firstHeaderValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const first = value.split(",")[0]?.trim();
  return first || undefined;
}

function normalizeHttpProtocol(value: string | undefined): string | undefined {
  const protocol = value?.toLowerCase();
  return protocol === "http" || protocol === "https" ? protocol : undefined;
}

function safeOrigin(protocol: string, host: string): string | null {
  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return null;
  }
}

/**
 * 解析请求对外可见的 Origin，优先级：
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. x-forwarded-proto + x-forwarded-host
 * 3. host 请求头
 * 4. request.url 自带的 Origin
 *
 * 反代（Caddy/Nginx）后面 request.nextUrl 常是 127.0.0.1:3000，
 * 不能直接用它构造重定向地址。
 */
export function getRequestOrigin(request: RequestLike): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // 配置非法时继续走请求头
    }
  }

  const requestUrl = new URL(request.url);
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));

  if (host) {
    const protocol =
      normalizeHttpProtocol(firstHeaderValue(request.headers.get("x-forwarded-proto"))) ??
      normalizeHttpProtocol(requestUrl.protocol.replace(":", "")) ??
      "http";
    const origin = safeOrigin(protocol, host);
    if (origin) return origin;
  }

  return requestUrl.origin;
}

export function buildAbsoluteUrl(request: RequestLike, path: string): URL {
  return new URL(path, `${getRequestOrigin(request)}/`);
}
