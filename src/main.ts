import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "virtual:uno.css";
import "@unocss/reset/normalize.css";
// import Lenis from "lenis";

// // 初始化 Lenis
// const lenis = new Lenis({
//     duration: 1.2,
//     easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//     smoothWheel: true,
//     touchMultiplier: 2,
// });

// function raf(time: number) {
//     lenis.raf(time);
//     requestAnimationFrame(raf);
// }

// requestAnimationFrame(raf);

createApp(App).mount("#app");
