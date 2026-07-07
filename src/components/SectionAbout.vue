<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ==================== 数据 ====================
const accordionItems = [
  {
    num: "01",
    enTitle: "Brand Analysis & Insight",
    zhTitle: "品牌分析洞察",
    desc: "我们相信，每一个成功的设计都源于深刻的理解。在启动任何项目之前，我们的策略团队会深入研究您的品牌核心、市场环境、竞争格局和目标用户画像。通过全面的数据分析和敏锐的行业洞察，我们挖掘品牌独特的价值主张，并将其转化为清晰、可执行的数字战略。这不仅是创意的起点，更是确保最终成果能够精准触达并打动用户的基石。"
  },
  {
    num: "02",
    enTitle: "Visual Creative Design",
    zhTitle: "设计视觉创意",
    desc: "创意是我们的语言，视觉是我们的画布。我们致力于将品牌战略转化为独一无二、令人难忘的视觉体验。从重塑品牌标识(VI)系统，到打造像素级完美的用户界面(UI)，我们的设计师团队将美学、功能性与用户心理学相结合。我们不只是追求好看，更是要创造出能够讲述品牌故事、引发情感共鸣，并驱动用户行动的卓越设计。"
  },
  {
    num: "03",
    enTitle: "Interactive Development",
    zhTitle: "开发交互体验",
    desc: "设计不止于所见，更在于所感。我们的技术团队是连接创意与现实的桥梁。我们将创意设计稿精准、高效地转化为高性能、高响应度的数字产品。无论是企业官网、电商平台、移动应用还是小程序，我们都专注于实现流畅的交互逻辑和无缝的用户体验(UX)。我们运用前沿技术，确保您的数字平台在任何设备上都能稳定、出色地运行。"
  },
  {
    num: "04",
    enTitle: "Maintenance and Optimization",
    zhTitle: "持续优化维护",
    desc: "您的数字平台上线不是终点，而是一个新旅程的开始。数字世界瞬息万变，持续的维护和优化是保持竞争力的关键。我们提供全方位的技术支持服务，包括安全监控、性能调优、功能迭代和内容更新。更重要的是，我们会通过数据分析，持续跟踪用户行为，并提出优化建议，帮助您的平台不断进化，实现长期的商业价值。"
  }
];

// ==================== 手风琴 ====================
const activeIndex = ref<number | null>(null);

const toggleAccordion = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

// ==================== 动画 ====================
const sectionRef = ref<any>();
const itemsContainerRef = ref<any>();
let ctx: gsap.Context | null = null;

onMounted(() => {
  ctx = gsap.context(() => {
    const section = sectionRef.value;

    // section 入场：从左侧旋转滑入
    gsap.fromTo(
      section,
      { x: "-14vw", rotation: 10, transformOrigin: "50% 50%" },
      {
        scrollTrigger: {
          trigger: section,
          start: "top 100%",
          end: "top 50%",
          toggleActions: "play none none reverse"
        },
        x: 0,
        rotation: 0,
        ease: "sine.inOut"
      }
    );

    // 手风琴项：随滚动依次从左侧淡入
    const items = itemsContainerRef.value.querySelectorAll(".underline-hover");

    gsap.from(items, {
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "top top",
        scrub: 0.8,
        toggleActions: "play none none reverse"
      },
      opacity: 0.8,
      x: "100vw",
      duration: 0.6,
      ease: "power2.out",
      stagger: {
        each: 0.25,
        from: "start",
        ease: "power1.inOut"
      }
    });
  });
});

onUnmounted(() => {
  ctx?.revert();
});
</script>

<template>
  <section ref="sectionRef" w-full bg-white z-1 relative lg:p-40 p-16 h-auto>
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
    <div flex flex-col items-end overflow-hidden ref="itemsContainerRef">
      <div
        v-for="(item, index) in accordionItems"
        :key="index"
        max-w-1218px
        py-40
        w-full
        relative
        border-b="1px solid #DCDCDC"
        cursor-pointer
        class="underline-hover"
        @click="toggleAccordion(index)"
      >
        <span
          class="font-['Inter'] text-[16px] text-[#3B4EFF] absolute top-[40px] left-[-64px] uppercase font-[400] hidden lg:block"
          >/ {{ item.num }}</span
        >
        <div flex items-center justify-between w-full>
          <div flex flex-col lg:flex-row lg:items-center items-start>
            <span
              class="font-['Inter'] lg:text-[64px] text-[24px] font-normal lg:leading-[64px] leading-[24px] text-[#000] mr-[16px]"
              >{{ item.enTitle }}</span
            >
            <span class="font-['Noto'] lg:text-[32px] text-[16px] mt-[8px] lg:mt-0 text-[#000]">{{
              item.zhTitle
            }}</span>
          </div>
          <img
            src="@/assets/image/add.svg"
            alt=""
            class="lg:w-[24px] lg:h-[24px] w-[16px] h-[16px] cursor-pointer transition-transform duration-300 hover:scale-110"
            :class="activeIndex === index ? 'rotate-45' : ''"
          />
        </div>
        <Transition name="accordion">
          <div class="remark-content" v-if="activeIndex === index">
            <p h-40></p>
            <p class="font-['Noto'] text-[16px] leading-[32px] text-[#666] whitespace-pre-line max-w-[935px]">
              {{ item.desc }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
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

.accordion-enter-active {
  overflow: hidden;
  transition:
    opacity 0.35s ease-out,
    max-height 0.4s ease-out;
}
.accordion-leave-active {
  overflow: hidden;
  transition:
    opacity 0.25s ease-in,
    max-height 0.3s ease-in;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
}
</style>
