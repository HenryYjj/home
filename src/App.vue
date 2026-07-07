<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";
import { useLenis } from "./composables/useLenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionAbout from "./components/SectionAbout.vue";
gsap.registerPlugin(ScrollTrigger);

useLenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
  orientation: "vertical",
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
const navContainer = ref<any>();

onMounted(() => {
  // 第一个 section：固定并让 textRef 向上滑出
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "section:first-child",
      start: "top top",
      end: "bottom  top",
      pin: true,
      scrub: true,
      // toggleActions: 'play none none reverse'
    },
  });

  tl.to(
    textRef.value,
    {
      rotation: -15,
      x: "-10vw",
      y: "-120vh",
      ease: "sine.inOut",
    },
    0,
  );

  // 导航栏动画
  const menuTrigger = navContainer.value.querySelector(".menu-trigger");
  const navItems = navContainer.value.querySelectorAll(
    "span:not(.menu-trigger)",
  );

  const lastNavItem = navContainer.value.querySelector("span:last-child");

  // 获取 CONTACT 联系的位置
  const contactRect = lastNavItem.getBoundingClientRect();
  const menuTriggerRect = menuTrigger.getBoundingClientRect();
  const distance = contactRect.left - menuTriggerRect.left;

  tl.to(
    menuTrigger,
    {
      x: distance,
      duration: 2.2,
      ease: "power1.inOut",
    },
    0,
  );

  // 其他导航项向上消失
  tl.to(
    navItems,
    {
      opacity: 0,
      y: -30,
      scale: 0.95,
      duration: 0.6,
      ease: "power2.in",
      stagger: {
        each: 0.25,
        from: "start",
        ease: "power1.inOut",
      },
    },
    0,
  );
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <div>
    <header
      flex
      justify-between
      px-40
      pt-24
      fixed
      top-0
      left-0
      right-0
      z-100
      lg:px-40
      px-16
      items-center
      transition-all
      duration-500
      ease-in-out
    >
      <div>
        <img src="@/assets/image/logo.svg" alt="" w-auto h-17 cursor-pointer />
      </div>
      <div
        class="nav"
        flex
        gap-120
        items-center
        text-16
        font-400
        leading-16
        text-white
        ref="navContainer"
      >
        <span class="menu-trigger">MENU</span>
        <span>HOME 首页</span>
        <span>WORKS 案例</span>
        <span>ABOUT 关于</span>
        <span>BLOG 博客</span>
        <span>CONTACT 联系</span>
      </div>
    </header>
    <div class="scroll-container">
      <section h-screen w-full class="section-0">
        <div
          w-full
          h-full
          bg="#3b4eff80"
          z-1
          relative
          ref="textRef"
          @mousemove="handleMouseMove"
        >
          <div
            absolute
            pointer-events-none
            :style="{ left: `${boxPosition.x}px`, top: `${boxPosition.y}px` }"
            text-white
            text-14
            font-300
          >
            SCROLL TO EXPLORE
          </div>
          <div absolute bottom-0 right-0 px-16 lg:px-40 left-0>
            <img src="@/assets/image/oneNew.svg" alt="" w-full />
          </div>
        </div>
        <video
          autoplay
          muted
          loop
          playsinline
          src="@/assets/vedio/1774442978283_onew.mp4"
          w-full
          h-100vh
          object-cover
          bg-image
          fixed
          top-0
          left-0
          z-[-1]
          style="
            translate: none;
            rotate: none;
            scale: none;
            transform-origin: 50% 50%;
            transform: translate(0px, 0px);
          "
        ></video>
      </section>
      <SectionAbout />
      <section w-full bg-blue z-1 relative class="section-2"></section>
      <section w-full bg-pink z-1 relative class="section-3"></section>
      <section
        h-screen
        w-full
        bg-yellow
        z-1
        relative
        class="section-4"
      ></section>
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
