import { defineConfig, transformerDirectives, presetUno,presetAttributify } from "unocss";
import presetRemToPx from "@unocss/preset-rem-to-px";

export default defineConfig({
  /** 预设 */
  presets: [
    /** 属性化模式 &amp; 无值的属性模式 */
    presetAttributify(),
    /** Tailwind CSS / Windi CSS v3 紧凑预设 */
    presetRemToPx({
      baseFontSize: 4,
    }),
    presetUno(),
  ],
  /** 转换器 */
  transformers: [
    /** 支持 @apply 指令 */
    transformerDirectives(),
  ],
  /** 自定义规则 */
  rules: [["uno-padding-20", { padding: "20px" }]],
  /** 自定义快捷方式 */
  shortcuts: {
    "uno-wh-full": "w-full h-full",
    "uno-flex-center": "flex justify-center items-center",
    "uno-flex-x-center": "flex justify-center",
    "uno-flex-y-center": "flex items-center",
  },
});
