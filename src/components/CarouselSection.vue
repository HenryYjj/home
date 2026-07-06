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

const currentSlide = ref(0);
const carouselSection = ref<HTMLElement>();

// 左右列表的滚动偏移量
const textTranslateY = ref(0);
const thumbTranslateY = ref(0);

// 列表容器引用
const textListRef = ref<HTMLElement>();
const thumbListRef = ref<HTMLElement>();

// 缓存每项的中心位置（offsetTop + offsetHeight/2），避免滚动时反复读取 DOM
let textItemCenters: number[] = [];
let thumbItemCenters: number[] = [];

// 缓存外层容器高度
let textContainerHeight = 0;
let thumbContainerHeight = 0;

let carouselST: ScrollTrigger | null = null;
let resizeObserver: ResizeObserver | null = null;

/** 缓存各项位置数据 */
function cachePositions() {
  if (textListRef.value) {
    textContainerHeight = textListRef.value.parentElement?.clientHeight ?? 0;
    textItemCenters = Array.from(textListRef.value.children).map(
      (child) => (child as HTMLElement).offsetTop + (child as HTMLElement).offsetHeight / 2
    );
  }
  if (thumbListRef.value) {
    thumbContainerHeight = thumbListRef.value.parentElement?.clientHeight ?? 0;
    thumbItemCenters = Array.from(thumbListRef.value.children).map(
      (child) => (child as HTMLElement).offsetTop + (child as HTMLElement).offsetHeight / 2
    );
  }
}

/**
 * 根据滚动进度插值计算 translateY，让列表平滑跟随滚动
 */
function applyProgress(progress: number) {
  const total = carouselSlides.length;
  const exactIndex = progress * total;
  const idx = Math.min(Math.floor(exactIndex), total - 1);
  const nextIdx = Math.min(idx + 1, total - 1);
  const t = exactIndex - idx; // 0 ~ 1 插值因子

  // 更新 currentSlide（用于背景切换）
  if (idx !== currentSlide.value) {
    currentSlide.value = idx;
  }

  // 左侧文字
  if (textItemCenters.length) {
    const center = textItemCenters[idx] + (textItemCenters[nextIdx] - textItemCenters[idx]) * t;
    textTranslateY.value = textContainerHeight / 2 - center;
  }

  // 右侧缩略图
  if (thumbItemCenters.length) {
    const center = thumbItemCenters[idx] + (thumbItemCenters[nextIdx] - thumbItemCenters[idx]) * t;
    thumbTranslateY.value = thumbContainerHeight / 2 - center;
  }
}

onMounted(() => {
  // 初始缓存位置
  cachePositions();

  // 监听尺寸变化
  resizeObserver = new ResizeObserver(cachePositions);
  if (carouselSection.value) {
    resizeObserver.observe(carouselSection.value);
  }

  // ========== 滚动驱动轮播 ==========
  carouselST = ScrollTrigger.create({
    trigger: ".section-2",
    start: "top top",
    end: `+=${(carouselSlides.length - 1) * 100}%`,
    pin: true,
    scrub: 0, // 滚动直接映射，无延迟
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      applyProgress(self.progress);
    }
  });
});

onUnmounted(() => {
  carouselST?.kill();
  resizeObserver?.disconnect();
});
</script>

<template>
  <section h-screen w-full relative overflow-hidden class="section-2" ref="carouselSection">
    <!-- ===== 背景图片层 ===== -->
    <div class="absolute inset-0 z-0 bg-black">
      <div
        v-for="(slide, i) in carouselSlides"
        :key="i"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="i === currentSlide ? 'opacity-100' : 'opacity-0'"
      >
        <img :src="slide.image" alt="" class="w-full h-full object-cover" />
      </div>
      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/50"></div>
    </div>

    <!-- ===== 内容区域 ===== -->
    <div class="relative z-10 flex items-center h-full lg:px-40 px-16 justify-evenly">
      <!-- ===== 左侧：竖向滚动文字列表 ===== -->
      <div class="flex-1 text-white p-l-[30%] overflow-hidden relative h-full py-32">
        <!-- 无 CSS transition，由 ScrollTrigger scrub 直接驱动 -->
        <div
          ref="textListRef"
          class="flex flex-col gap-6 lg:gap-8 relative"
          :style="{ transform: `translateY(${textTranslateY}px)` }"
        >
          <div
            v-for="(slide, i) in carouselSlides"
            :key="i"
            class="slide-text transition-opacity duration-300 ease-in-out cursor-pointer"
            :class="i === currentSlide ? 'opacity-100' : 'opacity-15 hover:opacity-30'"
          >
            <div class="flex items-baseline gap-40 lg:gap-60">
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-4">
                  <h2 class="font-['Inter'] lg:text-[64px] text-[22px] font-normal leading-tight truncate">
                    {{ slide.title }}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 右侧：竖向滚动缩略图列表 ===== -->
      <div class="flex-shrink-0 ml-8 lg:ml-16 overflow-hidden relative h-full py-32">
        <!-- 无 CSS transition，由 ScrollTrigger scrub 直接驱动 -->
        <div
          ref="thumbListRef"
          class="flex flex-col gap-30 relative"
          :style="{ transform: `translateY(${thumbTranslateY}px)` }"
        >
          <div
            v-for="(slide, i) in carouselSlides"
            :key="i"
            class="relative w-[240px] lg:w-[320px] h-[100px] lg:h-[130px] rounded-xl overflow-hidden transition-opacity duration-300 ease-in-out cursor-pointer group flex-shrink-0"
            :class="
              i === currentSlide
                ? 'opacity-100 shadow-2xl ring-1 ring-white/15'
                : 'opacity-20 hover:opacity-40 shadow-lg'
            "
          >
            <img :src="slide.thumb" alt="" class="w-full h-full object-cover" />
            <!-- 渐变遮罩 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
