import { JetBrains_Mono, Press_Start_2P } from "next/font/google";

// next/font 在构建时下载并自托管字体，运行时不会请求外部字体服务
export const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-press-start",
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});
