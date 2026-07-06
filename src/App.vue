<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";
import { useLenis } from "./composables/useLenis"; // 平滑滚动插件 Lenis
import gsap from "gsap"; // GSAP 动画库（专业级 Web 动画）
import { ScrollTrigger } from "gsap/ScrollTrigger"; // GSAP 滚动触发插件（让动画随滚动播放）
import CarouselSection from "./components/CarouselSection.vue"; // 轮播图组件
gsap.registerPlugin(ScrollTrigger); // 注册 ScrollTrigger 插件

// Lenis 配置：让页面滚动变得更平滑丝滑
const { lenis } = useLenis({
  duration: 1.2, // 滚动持续时长（秒），越大滚动越慢
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 缓动函数，让滚动有减速效果
  smoothWheel: true, // 启用鼠标滚轮平滑滚动
  touchMultiplier: 2, // 触摸滚动速度倍率
  orientation: "vertical" // 滚动方向：垂直
});

// "SCROLL TO EXPLORE" 文字的当前位置（实际渲染位置，通过动画平滑过渡）
const boxPosition = ref({
  x: 0,
  y: 0
});
// "SCROLL TO EXPLORE" 文字的目标位置（鼠标所指的位置）
const targetPosition = ref({
  x: 0,
  y: 0
});

let animationFrameId: number | null = null;

// 鼠标移动时，计算文字跟随的目标位置
const handleMouseMove = (e: MouseEvent) => {
  if (textRef.value) {
    const rect = textRef.value.getBoundingClientRect(); // 获取容器的尺寸和位置
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

// 动画循环：用线性插值让文字平滑跟随鼠标，而不是直接跳过去
const animate = () => {
  const ease = 0.15; // 插值系数（0~1），越小跟随越慢越丝滑
  boxPosition.value.x += (targetPosition.value.x - boxPosition.value.x) * ease;
  boxPosition.value.y += (targetPosition.value.y - boxPosition.value.y) * ease;

  animationFrameId = requestAnimationFrame(animate); // 请求下一帧继续执行
};

// 启动动画循环
animationFrameId = requestAnimationFrame(animate);

const textRef = ref<any>(); // 指向 "SCROLL TO EXPLORE" 文字所在的容器
const navContainer = ref<any>(); // 指向导航栏容器

onMounted(() => {
  // ========== GSAP 时间线动画（所有动画按时间线组织播放） ==========
  // 第一个 section：固定（pin）在视口，然后让 "SCROLL TO EXPLORE" 向上滑出
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "section:first-child", // 触发元素：第一个 section
      start: "top top", // 触发点：section 顶部到达视口顶部
      end: "bottom  top", // 结束点：section 底部到达视口顶部
      pin: true, // 固定该 section，滚动时不动
      scrub: true // 动画进度与滚动位置绑定（滚多少，动画走多少）
    }
  });

  // "SCROLL TO EXPLORE" 文字：旋转 -15°，向左移动 10vw，向上移动 120vh（飞出屏幕）
  tl.to(
    textRef.value,
    {
      rotation: -15, // 旋转角度
      x: "-10vw", // 水平位移（视口宽度的 -10%）
      y: "-120vh", // 垂直位移（视口高度的 -120%）
      ease: "sine.inOut" // 缓动函数，先加速后减速
    },
    0 // 在第 0 秒开始（时间线起点）
  );

  // ========== 导航栏动画（独立 ScrollTrigger，不与滚动条绑定） ==========
  const menuTrigger = navContainer.value.querySelector(".menu-trigger"); // "MENU" 按钮
  const navItems = navContainer.value.querySelectorAll("span:not(.menu-trigger)"); // 其他导航项
  const lastNavItem = navContainer.value.querySelector("span:last-child"); // "CONTACT 联系"

  // 计算 "MENU" 到 "CONTACT" 的距离，用于将 MENU 滑动到 CONTACT 的位置（合并成一项）
  const contactRect = lastNavItem.getBoundingClientRect();
  const menuTriggerRect = menuTrigger.getBoundingClientRect();
  const distance = contactRect.left - menuTriggerRect.left;

  // 菜单动画时间线：开始滚动时触发完整播放
  const menuTl = gsap.timeline({
    paused: true // 初始暂停，由首次滚动事件触发
  });

  // "MENU" 按钮水平滑动到 "CONTACT" 的位置
  menuTl.to(
    menuTrigger,
    {
      x: distance, // 水平移动距离
      duration: 2.2, // 动画持续 2.2 秒
      ease: "power1.inOut" // 缓动：先加速后减速
    },
    0
  );
  // 其他导航项（HOME / WORKS / ABOUT / BLOG）向上淡出消失
  menuTl.to(
    navItems,
    {
      opacity: 0, // 透明度变为 0（消失）
      y: -30, // 向上移动 30px
      scale: 0.95, // 稍微缩小
      duration: 0.6, // 持续 0.6 秒
      ease: "power2.in", // 缓动：加速进入
      stagger: {
        // 逐个依次动画，形成波浪效果
        each: 0.25, // 每个间隔 0.25 秒
        from: "start", // 从第一个开始
        ease: "power1.inOut"
      }
    },
    0
  );

  // 第 2 个 section（.section-1）初始状态：旋转 10°，水平偏移
  (gsap.set(".section-1", {
    transformOrigin: "50% 50%", // 变换原点在中心
    x: "-14vw", // 水平偏移 -14% 视口宽度
    y: "0",
    rotation: 10 // 旋转 10°
  }),
    // 滚动到 .section-1 时，旋转归零、位移归零（恢复原位）
    gsap.to(".section-1", {
      scrollTrigger: {
        trigger: ".section-1", // 触发元素
        start: "top 100%", // .section-1 顶部到达视口底部时开始
        end: "top 50%", // .section-1 顶部到达视口中间时结束
        scrub: !0, // 滚动与动画进度同步（true）
        toggleActions: "play none none reverse", // 进入时播放，离开时反向播放
        onLeave: () => {
          // 离开时：重置 .section-3 的变换
          gsap.set(".section-3", {
            x: 0,
            y: 0,
            rotation: 0
          });
        },
        onEnterBack: () => {
          // 往回滚动进入时：同样重置
          gsap.set(".section-3", {
            x: 0,
            y: 0,
            rotation: 0
          });
        }
      },
      x: 0,
      y: 0,
      rotation: 0, // 最终状态：归位
      ease: "sine.inOut"
    }));

  // ========== 菜单动画：向下滚动播放（全局），仅回到 section-0 时才反向 ==========
  const onMenuScroll = (e: any) => {
    if (e.direction === 1 && (menuTl.reversed() || menuTl.progress() === 0)) {
      // 向下滚动 → 正向播放
      menuTl.play();
    }
  };
  lenis.value?.on("scroll", onMenuScroll);

  // 只有滚动回 section-0 顶部时才反向
  ScrollTrigger.create({
    trigger: "section:first-child",
    start: "top top",
    end: "bottom top",
    onLeaveBack: () => {
      if (menuTl.progress() > 0 && !menuTl.reversed()) {
        menuTl.reverse();
      }
    }
  });
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId); // 组件销毁时取消动画循环，防止内存泄漏
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
      <section h-screen w-full class="section-0">
        <div w-full h-full bg="#3b4eff80" z-1 relative ref="textRef" @mousemove="handleMouseMove">
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
          style="translate: none; rotate: none; scale: none; transform-origin: 50% 50%; transform: translate(0px, 0px)"
        ></video>
      </section>
      <section h-screen w-full bg-white z-1 relative class="section-1" lg:p-40 p-16 overflow-hidden>
        <div lg:text-16 text-12 text="#000">
          <span>/</span>
          <span>关于我们</span>
        </div>
        <div
          class="text-[#0B0B0B] font-['Inter'] lg:text-[160px] text-[64px] font-normal capitalize lg:leading-[160px] leading-[64px] lg:mb-[40px] mb-[16px]"
        >
          creativity
        </div>
        <div>
          <div
            w-165
            h-48
            flex
            items-center
            justify-between
            px-20
            border-l="2px solid black"
            hover:bg="#3e4df9"
            hover:text-white
            cursor-pointer
          >
            <span>ABOUT 关于</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" w16 h-16>
              <line x1="8" y1="32" x2="48" y2="32" stroke="#fff" stroke-width="4" stroke-linecap="round" />
              <polyline
                points="40,22 50,32 40,42"
                fill="none"
                stroke="#fff"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div flex flex-col items-end overflow-hidden>
          <div max-w-1218px py-40 w-full relative>
            <span
              class="font-['Inter'] text-[16px] text-[#3B4EFF] absolute top-[40px] left-[-64px] uppercase font-[400] hidden lg:block"
              >/ 01</span
            >
            <div flex items-center justify-between w-full>
              <div flex flex-col lg:flex-row lg:items-center items-start>
                <span
                  class="font-['Inter'] lg:text-[64px] text-[24px] font-normal lg:leading-[64px] leading-[24px] text-[#000] mr-[16px]"
                  >Brand Analysis &amp; Insight</span
                >
                <span data-v-de89f2a2="" class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >品牌分析洞察</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
          <div max-w-1218px py-40 w-full relative>
            <span
              class="font-['Inter'] text-[16px] text-[#3B4EFF] absolute top-[40px] left-[-64px] uppercase font-[400] hidden lg:block"
              >/ 02</span
            >
            <div flex items-center justify-between w-full>
              <div flex flex-col lg:flex-row lg:items-center items-start>
                <span
                  class="font-['Inter'] lg:text-[64px] text-[24px] font-normal lg:leading-[64px] leading-[24px] text-[#000] mr-[16px]"
                  >Visual Creative Design</span
                >
                <span data-v-de89f2a2="" class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >设计视觉创意</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
          <div max-w-1218px py-40 w-full relative>
            <span
              class="font-['Inter'] text-[16px] text-[#3B4EFF] absolute top-[40px] left-[-64px] uppercase font-[400] hidden lg:block"
              >/ 03</span
            >
            <div flex items-center justify-between w-full>
              <div flex flex-col lg:flex-row lg:items-center items-start>
                <span
                  class="font-['Inter'] lg:text-[64px] text-[24px] font-normal lg:leading-[64px] leading-[24px] text-[#000] mr-[16px]"
                  >Interactive Development</span
                >
                <span data-v-de89f2a2="" class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >开发交互体验</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
          <div max-w-1218px py-40 w-full relative>
            <span
              class="font-['Inter'] text-[16px] text-[#3B4EFF] absolute top-[40px] left-[-64px] uppercase font-[400] hidden lg:block"
              >/ 04</span
            >
            <div flex items-center justify-between w-full>
              <div flex flex-col lg:flex-row lg:items-center items-start>
                <span
                  class="font-['Inter'] lg:text-[64px] text-[24px] font-normal lg:leading-[64px] leading-[24px] text-[#000] mr-[16px]"
                  >Maintenance and Optimization</span
                >
                <span data-v-de89f2a2="" class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >持续优化维护</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>
        </div>
      </section>
      <CarouselSection />
      <section h-screen w-full bg-pink z-1 relative class="section-3"></section>
      <section h-screen w-full bg-yellow z-1 relative class="section-4"></section>
      <section h-screen w-full bg-orange z-1 relative class="section-5"></section>
      <section h-screen w-full bg-green z-1 relative class="section-6"></section>
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
