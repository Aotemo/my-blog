import { MAX_UPLOAD_SIZE } from "./constants";

const MAX_DIMENSION = 2560;
const COMPRESSION_QUALITY = 0.85;

export type UploadedImage = {
  url: string;
  alt: string;
};

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function getImageAlt(file: File): string {
  const name = file.name?.trim();
  if (!name) return "image";
  const base = name.replace(/\.[^./\\]+$/, "").trim();
  return base || "image";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败，请换一张图片"));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, COMPRESSION_QUALITY);
  });
}

async function compressImage(file: File): Promise<File> {
  const image = await loadImage(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法压缩图片");

  context.drawImage(image, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg");
  }
  if (!blob) throw new Error("图片压缩失败，请换一张图片");

  if (blob.size > MAX_UPLOAD_SIZE) {
    throw new Error("图片压缩后仍超过 5MB，请换一张更小的图片");
  }

  const base = getImageAlt(file) || "image";
  const extension = blob.type === "image/webp" ? ".webp" : ".jpg";
  return new File([blob], `${base}${extension}`, { type: blob.type });
}

async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_SIZE) return file;

  if (file.type === "image/gif") {
    throw new Error("GIF 超过 5MB 且无法压缩，请换一张更小的图片");
  }

  return compressImage(file);
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!isImageFile(file)) {
    throw new Error("仅支持图片文件");
  }

  const prepared = await prepareImage(file);
  const formData = new FormData();
  formData.append("file", prepared);

  let response: Response;
  try {
    response = await fetch("/api/upload", { method: "POST", body: formData });
  } catch {
    throw new Error("网络异常，图片上传失败");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.url) {
    throw new Error(payload?.error ?? "图片上传失败");
  }

  return { url: payload.data.url as string, alt: getImageAlt(file) };
}
