<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// ========== 轮播图数据 ==========
const carouselSlides = [
  {
    num: "/ 01",
    title: "Brand Experience",
    subtitle: "品牌体验",
    desc: "Creating memorable brand interactions that leave lasting impressions.",
    image: "https://picsum.photos/seed/brand-exp/1920/1080",
    thumb: "https://picsum.photos/seed/brand-exp/400/500"
  },
  {
    num: "/ 02",
    title: "Visual Identity",
    subtitle: "视觉识别",
    desc: "Developing cohesive visual languages that communicate your brand story.",
    image: "https://picsum.photos/seed/visual-id/1920/1080",
    thumb: "https://picsum.photos/seed/visual-id/400/500"
  },
  {
    num: "/ 03",
    title: "Digital Product",
    subtitle: "数字产品",
    desc: "Designing intuitive digital products that users love.",
    image: "https://picsum.photos/seed/digital-pdt/1920/1080",
    thumb: "https://picsum.photos/seed/digital-pdt/400/500"
  },
  {
    num: "/ 04",
    title: "Motion Design",
    subtitle: "动态设计",
    desc: "Bringing interfaces to life with purposeful animation.",
    image: "https://picsum.photos/seed/motion-dsn/1920/1080",
    thumb: "https://picsum.photos/seed/motion-dsn/400/500"
  },
  {
    num: "/ 05",
    title: "User Experience",
    subtitle: "用户体验",
    desc: "Designing user-centric interfaces that enhance engagement and satisfaction.",
    image: "https://picsum.photos/seed/user-exp/1920/1080",
    thumb: "https://picsum.photos/seed/user-exp/400/500"
  },
  {
    num: "/ 06",
    title: "Digital Product",
    subtitle: "数字产品",
    desc: "Designing intuitive digital products that users love.",
    image: "https://picsum.photos/seed/digital-pdt/1920/1080",
    thumb: "https://picsum.photos/seed/digital-pdt/400/500"
  },
  {
    num: "/ 07",
    title: "Motion Design",
    subtitle: "动态设计",
    desc: "Bringing interfaces to life with purposeful animation.",
    image: "https://picsum.photos/seed/motion-dsn/1920/1080",
    thumb: "https://picsum.photos/seed/motion-dsn/400/500"
  },
  {
    num: "/ 08",
    title: "User Experience",
    subtitle: "用户体验",
    desc: "Designing user-centric interfaces that enhance engagement and satisfaction.",
    image: "https://picsum.photos/seed/user-exp/1920/1080",
    thumb: "https://picsum.photos/seed/user-exp/400/500"
  },
  {
    num: "/ 09",
    title: "Digital Product",
    subtitle: "数字产品",
    desc: "Designing intuitive digital products that users love.",
    image: "https://picsum.photos/seed/digital-pdt/1920/1080",
    thumb: "https://picsum.photos/seed/digital-pdt/400/500"
  },
  {
    num: "/ 10",
    title: "Motion Design",
    subtitle: "动态设计",
    desc: "Bringing interfaces to life with purposeful animation.",
    image: "https://picsum.photos/seed/motion-dsn/1920/1080",
    thumb: "https://picsum.photos/seed/motion-dsn/400/500"
  }
];

const SLIDE_COUNT = carouselSlides.length;

// --- 响应式状态 ---
const currentSlide = ref(0);
const carouselSection = ref<HTMLElement>();
const textListRef = ref<HTMLElement>();
const thumbListRef = ref<HTMLElement>();
const textY = ref(0);
const thumbY = ref(0);

// --- 缓存数据 ---
let textCenters: number[] = [];
let thumbCenters: number[] = [];
let textContainerH = 0;
let thumbContainerH = 0;

let st: ScrollTrigger | null = null;
let ro: ResizeObserver | null = null;

function recalc() {
  if (textListRef.value) {
    textContainerH = textListRef.value.parentElement!.clientHeight;
    textCenters = Array.from(textListRef.value.children).map(
      (c) => (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight / 2
    );
  }
  if (thumbListRef.value) {
    thumbContainerH = thumbListRef.value.parentElement!.clientHeight;
    thumbCenters = Array.from(thumbListRef.value.children).map(
      (c) => (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight / 2
    );
  }

  if (textCenters.length >= 2 && st) {
    const totalPx = textCenters[textCenters.length - 1] - textCenters[0];
    st.vars.end = () => `+=${totalPx * 1.5}`;
    st.refresh();
  }
}

function setByProgress(p: number) {
  const fi = p * (SLIDE_COUNT - 1);
  const idx = Math.floor(fi);
  const next = Math.min(idx + 1, SLIDE_COUNT - 1);
  const frac = fi - idx;

  currentSlide.value = Math.min(Math.floor(p * SLIDE_COUNT), SLIDE_COUNT - 1);

  if (textCenters.length) {
    textY.value = textContainerH / 2 - (textCenters[idx] + (textCenters[next] - textCenters[idx]) * frac);
  }
  if (thumbCenters.length) {
    thumbY.value = thumbContainerH / 2 - (thumbCenters[idx] + (thumbCenters[next] - thumbCenters[idx]) * frac);
  }
}

onMounted(() => {
  st = ScrollTrigger.create({
    trigger: ".section-2",
    start: "top top",
    end: "+=100%",
    pin: true,
    scrub: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    snap: {
      snapTo: carouselSlides.map((_, i) => i / (SLIDE_COUNT - 1)),
      duration: 0.4,
      ease: "power2.out"
    },
    onUpdate(self) {
      setByProgress(self.progress);
    }
  });

  recalc();

  ro = new ResizeObserver(recalc);
  if (carouselSection.value) ro.observe(carouselSection.value);
});

onUnmounted(() => {
  st?.kill();
  ro?.disconnect();
});
</script>

<template>
  <section h-screen w-full relative overflow-hidden class="section-2" ref="carouselSection">
    <!-- ===== 背景图片层 ===== -->
    <div class="absolute inset-0 z-0 bg-black">
      <div
        v-for="(slide, i) in carouselSlides"
        :key="i"
        class="absolute inset-0 transition-opacity duration-500 ease-in-out"
        :class="i === currentSlide ? 'opacity-100' : 'opacity-0'"
      >
        <img :src="slide.image" alt="" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/50" />
    </div>

    <!-- ===== 内容区域 ===== -->
    <div class="relative z-10 flex items-center h-full lg:px-40 px-16 justify-evenly">
      <!-- 左侧文字列表 -->
      <div class="flex-1 text-white p-l-[30%] overflow-hidden relative h-full py-32">
        <div
          ref="textListRef"
          class="flex flex-col gap-6 lg:gap-8 relative"
          :style="{ transform: `translateY(${textY}px)` }"
        >
          <div
            v-for="(slide, i) in carouselSlides"
            :key="i"
            class="slide-text transition-opacity duration-300 cursor-pointer"
            :class="i === currentSlide ? 'opacity-100' : 'opacity-15 hover:opacity-30'"
          >
            <h2 class="font-['Inter'] lg:text-[64px] text-[22px] font-normal leading-tight truncate">
              {{ slide.title }}
            </h2>
          </div>
        </div>
      </div>

      <!-- 右侧缩略图列表 -->
      <div class="flex-shrink-0 ml-8 lg:ml-16 overflow-hidden relative h-full py-32">
        <div ref="thumbListRef" class="flex flex-col gap-30 relative" :style="{ transform: `translateY(${thumbY}px)` }">
          <div
            v-for="(slide, i) in carouselSlides"
            :key="i"
            class="relative w-[120px] lg:w-[214px] h-[100px] lg:h-[130px] rounded-xl overflow-hidden transition-opacity duration-300 cursor-pointer group flex-shrink-0"
            :class="
              i === currentSlide
                ? 'opacity-100 shadow-2xl ring-1 ring-white/15'
                : 'opacity-20 hover:opacity-40 shadow-lg'
            "
          >
            <img :src="slide.thumb" alt="" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
