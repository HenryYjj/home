<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";
import { useLenis } from "./composables/useLenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
const aboutContainer = ref<any>();

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

  const aboutItems = aboutContainer.value.querySelectorAll(".underline-hover");
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

  // 关于导航栏动画

  gsap.set(".section-1", {
    transformOrigin: "50% 50%",
    x: "-14vw",
    y: "0",
    rotation: 10,
  });

  gsap.to(".section-1", {
    scrollTrigger: {
      trigger: ".section-1",
      start: "top 100%",
      end: "top 50%",
      toggleActions: "play none none reverse",
    },
    x: 0,
    y: 0,
    rotation: 0,
    ease: "sine.inOut",
  });

  gsap.from(aboutItems, {
    scrollTrigger: {
      trigger: ".section-1",
      start: "top top",
      end: "bottom top",
      pin: true,
      scrub: true,
      markers: true,
    },
    opacity: 1,
    x: "100vw",
    duration: 0.6,
    ease: "power2.out",
    stagger: {
      each: 0.25,
      from: "start",
      ease: "power1.inOut",
    },
  });
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

const flag = ref<boolean[]>([false, false, false, false]);

const handleFlag = (index: number) => {
  // 只允许一个 flag 为 true
  flag.value.forEach((_, i) => {
    if (i !== index) {
      flag.value[i] = false;
    }
  });
  flag.value[index] = !flag.value[index];
};
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
      <section w-full bg-white z-1 relative class="section-1" lg:p-40 p-16>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              w16
              h-16
            >
              <line
                x1="8"
                y1="32"
                x2="48"
                y2="32"
                stroke="#fff"
                stroke-width="4"
                stroke-linecap="round"
              />
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
        <div flex flex-col items-end overflow-hidden ref="aboutContainer">
          <div
            max-w-1218px
            py-40
            w-full
            relative
            border-b="1px solid #DCDCDC"
            cursor-pointer
            class="underline-hover"
            @click="handleFlag(0)"
          >
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
                <span
                  class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >品牌分析洞察</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
            <Transition name="fade">
              <div class="remark-content" v-if="flag[0]">
                <p h-40></p>
                <p
                  class="font-['Noto'] text-[16px] leading-[32px] text-[#666] whitespace-pre-line max-w-[935px]"
                >
                  我们相信，每一个成功的设计都源于深刻的理解。在启动任何项目之前，我们的策略团队会深入研究您的品牌核心、市场环境、竞争格局和目标用户画像。通过全面的数据分析和敏锐的行业洞察，我们挖掘品牌独特的价值主张，并将其转化为清晰、可执行的数字战略。这不仅是创意的起点，更是确保最终成果能够精准触达并打动用户的基石。
                </p>
              </div>
            </Transition>
          </div>
          <div
            max-w-1218px
            py-40
            w-full
            relative
            border-b="1px solid #DCDCDC"
            cursor-pointer
            class="underline-hover"
            @click="handleFlag(1)"
          >
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
                <span
                  class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >设计视觉创意</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
            <Transition name="fade">
              <div class="remark-content" v-if="flag[1]">
                <p h-40></p>
                <p
                  class="font-['Noto'] text-[16px] leading-[32px] text-[#666] whitespace-pre-line max-w-[935px]"
                >
                  创意是我们的语言，视觉是我们的画布。我们致力于将品牌战略转化为独一无二、令人难忘的视觉体验。从重塑品牌标识(VI)系统，到打造像素级完美的用户界面(UI)，我们的设计师团队将美学、功能性与用户心理学相结合。我们不只是追求好看，更是要创造出能够讲述品牌故事、引发情感共鸣，并驱动用户行动的卓越设计。
                </p>
              </div></Transition
            >
          </div>
          <div
            max-w-1218px
            py-40
            w-full
            relative
            border-b="1px solid #DCDCDC"
            cursor-pointer
            class="underline-hover"
            @click="handleFlag(2)"
          >
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
                <span
                  class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >开发交互体验</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
            <Transition name="fade">
              <div class="remark-content" v-if="flag[2]">
                <p h-40></p>
                <p
                  class="font-['Noto'] text-[16px] leading-[32px] text-[#666] whitespace-pre-line max-w-[935px]"
                >
                  设计不止于所见，更在于所感。我们的技术团队是连接创意与现实的桥梁。我们将创意设计稿精准、高效地转化为高性能、高响应度的数字产品。无论是企业官网、电商平台、移动应用还是小程序，我们都专注于实现流畅的交互逻辑和无缝的用户体验(UX)。我们运用前沿技术，确保您的数字平台在任何设备上都能稳定、出色地运行。
                </p>
              </div>
            </Transition>
          </div>
          <div
            max-w-1218px
            py-40
            w-full
            relative
            border-b="1px solid #DCDCDC"
            cursor-pointer
            class="underline-hover"
            @click="handleFlag(3)"
          >
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
                <span
                  class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]"
                  >持续优化维护</span
                >
              </div>
              <img
                src="@/assets/image/add.svg"
                alt=""
                class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </div>
            <Transition name="fade">
              <div class="remark-content" v-if="flag[3]">
                <p h-40></p>
                <p
                  class="font-['Noto'] text-[16px] leading-[32px] text-[#666] whitespace-pre-line max-w-[935px]"
                >
                  您的数字平台上线不是终点，而是一个新旅程的开始。数字世界瞬息万变，持续的维护和优化是保持竞争力的关键。我们提供全方位的技术支持服务，包括安全监控、性能调优、功能迭代和内容更新。更重要的是，我们会通过数据分析，持续跟踪用户行为，并提出优化建议，帮助您的平台不断进化，实现长期的商业价值。
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </section>
      <section h-screen w-full bg-blue z-1 relative class="section-2"></section>
      <section h-screen w-full bg-pink z-1 relative class="section-3"></section>
      <section
        h-screen
        w-full
        bg-yellow
        z-1
        relative
        class="section-4"
      ></section>
      <section
        h-screen
        w-full
        bg-orange
        z-1
        relative
        class="section-5"
      ></section>
      <section
        h-screen
        w-full
        bg-green
        z-1
        relative
        class="section-6"
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

.underline-hover::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #3b4eff;
  transition: width 0.4s ease-out;
}
.underline-hover:hover::after {
  width: 100%;
}
.underline-hover:not(:hover)::after {
  width: 0;
  transition: width 0.5s ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
