<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";
import { useLenis } from "./composables/useLenis";
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

useLenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
});

const boxPosition = ref({
  x: 0,
  y: 0,
});
const targetPosition = ref({
  x: 0,
  y: 0,
});

let animationFrameId: number | null = null;

const handleMouseMove = (e: MouseEvent) => {
  if (textRef.value) {
    const rect = textRef.value.getBoundingClientRect();
    // 计算鼠标在容器内的位置
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    // 文字在鼠标右边偏移 30px
    let targetX = mouseX + 30;
    let targetY = mouseY;

    // 限制不超出容器右边界
    const maxX = rect.width - 200; // 假设文字宽度约 200px
    if (targetX > maxX) {
      targetX = mouseX - 200; // 如果超出右边界，放到鼠标左边
    }

    // 限制不超出容器底部
    const maxY = rect.height - 30;
    targetY = Math.max(10, Math.min(maxY, targetY));

    targetPosition.value.x = targetX;
    targetPosition.value.y = targetY;
  }
};

const animate = () => {
  // 使用线性插值让移动更丝滑
  const ease = 0.15;
  boxPosition.value.x += (targetPosition.value.x - boxPosition.value.x) * ease;
  boxPosition.value.y += (targetPosition.value.y - boxPosition.value.y) * ease;

  animationFrameId = requestAnimationFrame(animate);
};

// 启动动画循环
animationFrameId = requestAnimationFrame(animate);



const textRef = ref<any>();

onMounted(() => {
  // 第一个 section：固定并让 textRef 向上滑出
  gsap.to(textRef.value, {
    scrollTrigger: {
      trigger: 'section:first-child',
      start: 'top top',
      end: 'bottom  top', // 滚动 100vh 的距离
      pin: true, // 固定第一个 section
      scrub: true,
      // markers: true,
    },
    rotation: -15, // 逆时针旋转90°
    x: "-10vw", // 向左轻微偏移
    y: "-130vh", // 向上轻微偏移
    ease: "sine.inOut",
  })
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

});


</script>

<template>
  <div>
    <header flex justify-between px-40 pt-24 fixed top-0 left-0 right-0 z-100 lg:px-40 px-16 items-center transition-all
      duration-500 ease-in-out>
      <div>
        <img src="@/assets/image/logo.svg" alt="" w-auto h-17 cursor-pointer />
      </div>
      <div class="nav" flex gap-120 items-center text-16 font-400 leading-16 text-white ref="navContainer">
        <span class="menu-trigger">MENU</span>
        <span>HOME 首页</span>
        <span>WORKS 案例</span>
        <span>ABOUT 关于</span>
        <span>BLOG 博客</span>
        <span>CONTACT 联系</span>
      </div>
    </header>
    <div class="scroll-container">
      <section h-screen w-full>
        <div w-full h-full bg="#3b4eff80" z-1 relative ref="textRef" @mousemove="handleMouseMove">
          <div absolute pointer-events-none :style="{ left: `${boxPosition.x}px`, top: `${boxPosition.y}px` }"
            text-white text-14 font-300>
            SCROLL TO EXPLORE
          </div>
          <div absolute bottom-0 right-0 px-16 lg:px-40 left-0>
            <img src="@/assets/image/oneNew.svg" alt="" w-full />
          </div>
        </div>
        <video autoplay muted loop playsinline src="@/assets/vedio/1774442978283_onew.mp4" w-full h-100vh object-cover
          bg-image fixed top-0 left-0 z-[-1]
          style="translate: none; rotate: none; scale: none; transform-origin: 50% 50%; transform: translate(0px, 0px)"></video>
      </section>
      <section h-screen w-full bg-white z-1 relative></section>
      <section h-screen w-full bg-blue z-1 relative></section>
      <section h-screen w-full bg-pink z-1 relative></section>
      <section h-screen w-full bg-yellow z-1 relative></section>
      <section h-screen w-full bg-orange z-1 relative></section>
      <section h-screen w-full bg-green z-1 relative></section>
    </div>
  </div>
</template>

<style lang="css" scoped>
header {
  opacity: 0.99;
  color: rgb(255, 255, 255);
  background-color: transparent;
}

.nav span {
  @apply hover:underline hover:underline-offset-4 cursor-pointer;
}
</style>
