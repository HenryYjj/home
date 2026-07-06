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
const THUMB_GAP = 140; // 缩略图沿圆弧的固定像素间距（需 > 缩略图宽度 + 间距）
const FRONT = 0; // "正面"位置：0° = 正右方（3 点钟方向）

let angleStepDeg = 190; // 每个缩略图之间的角度步长（°），由 recalc 根据半径动态计算

// --- 响应式状态 ---
const currentSlide = ref(0); // 当前激活的 slide 索引
const slideProgress = ref(0); // 滚动进度 0~1
const carouselSection = ref<HTMLElement>(); // section 根元素
const textListRef = ref<HTMLElement>(); // 文字列表容器
const textY = ref(0); // 文字列表 translateY 偏移

// 圆形轨道参数（由 recalc 计算）
const orbitCX = ref(0); // 圆心 X
const orbitCY = ref(0); // 圆心 Y
const orbitR = ref(400); // 半径

// --- 缓存数据 ---
let textCenters: number[] = []; // 每个文字 item 中心的 Y 坐标数组
let textContainerH = 0; // 文字容器可视高度

let st: ScrollTrigger | null = null; // ScrollTrigger 实例
let ro: ResizeObserver | null = null; // 窗口 resize 监听

/**
 * 重新计算布局参数（窗口 resize 或初始化时调用）
 * - 圆形轨道圆心 / 半径
 * - 文字列表每个 item 的中心坐标
 * - 动态更新 ScrollTrigger 的滚动距离
 */
function recalc() {
  const sec = carouselSection.value;
  if (sec) {
    orbitCX.value = sec.clientWidth * 0.5; // 圆心 X：页面居中
    orbitCY.value = sec.clientHeight * 0.5; // 圆心 Y：垂直居中
    orbitR.value = Math.min(sec.clientWidth, sec.clientHeight) * 0.85; // 半径
    // 固定像素间距 → 角度步长
    angleStepDeg = (THUMB_GAP / orbitR.value) * (180 / Math.PI);
  }
  if (textListRef.value) {
    // 文字容器可视高度（用于垂直居中计算）
    textContainerH = textListRef.value.parentElement!.clientHeight;
    // 每个文字 item 的中心 Y 坐标
    textCenters = Array.from(textListRef.value.children).map(
      (c) => (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight / 2
    );
  }
  if (textCenters.length >= 2 && st) {
    // 根据文字总高度动态设置 ScrollTrigger 的滚动距离
    const totalPx = textCenters[textCenters.length - 1] - textCenters[0];
    st.vars.end = () => `+=${totalPx * 1.5}`;
    st.refresh();
  }
}

// 缩略图 DOM 引用（非响应式，GSAP 直接操作）
const thumbEls: (HTMLElement | null)[] = [];

/**
 * GSAP 驱动缩略图在圆形轨道上的 2D 位置与样式
 * @param progress - ScrollTrigger 进度 0~1
 *
 * 核心逻辑：
 * 1. 根据 progress 计算整体旋转角度 rotation
 * 2. 缩略图沿圆弧以固定像素间距排列：angleDeg = FRONT + i*angleStepDeg - rotation
 * 3. 计算与"正面"的角距离 diff，归一化为 t（0~1）
 * 4. t 越大 → 离正面越远 → 越小、越透明、层级越低
 */
function updateThumbs(progress: number) {
  // 整体顺时针累计旋转角度（用固定角度步长替代均分 360°）
  const rotation = progress * angleStepDeg * (SLIDE_COUNT - 1);
  const cx = orbitCX.value;
  const cy = orbitCY.value;
  const r = orbitR.value;
  const active = currentSlide.value;

  for (let i = 0; i < SLIDE_COUNT; i++) {
    const el = thumbEls[i];
    if (!el) continue;

    // 固定像素间距 → 角度步长，所有缩略图均匀排列
    const angleDeg = FRONT + i * angleStepDeg - rotation;
    const rad = (angleDeg * Math.PI) / 180;

    // 到"正面"的角距离，归一化到 -180°~180°，再取绝对值
    let diff = ((((angleDeg - FRONT) % 360) + 540) % 360) - 180;
    diff = Math.abs(diff);
    // t = 0 → 在正面；t = 1 → 距正面 90° 或更远
    const t = Math.min(diff / 90, 1);

    // 使用 gsap.set 直接操作 DOM，避免 Vue 响应式开销
    gsap.set(el, {
      left: cx + r * Math.cos(rad), // 圆上 X 坐标
      top: cy + r * Math.sin(rad), // 圆上 Y 坐标
      xPercent: -50, // 水平居中锚点
      yPercent: -50, // 垂直居中锚点
      scale: 1, // 大小不变
      opacity: 1,
      zIndex: Math.round((1 - t) * 100), // 靠近正面的层级更高
      pointerEvents: t > 0.5 ? "none" : "auto", // 半透明后不可点击
      boxShadow: "none",
      borderColor: "transparent"
      // boxShadow: i === active ? "0 0 20px rgba(255,255,255,0.35)" : "none", // 当前激活高亮
      // borderColor: i === active ? "rgba(255,255,255,0.2)" : "transparent"
    });
  }
}

/**
 * ScrollTrigger 进度 → 界面状态映射
 * @param p - 滚动进度 0~1
 *
 * 同步更新：
 * - slideProgress（缩略图轨道旋转）
 * - currentSlide（当前激活项索引）
 * - textY（文字列表垂直位移，保持当前项在视口中央）
 * - updateThumbs（缩略图 GSAP 动画）
 */
function setByProgress(p: number) {
  slideProgress.value = p;

  // fi = 浮点索引，如 2.7 表示在第 2~3 项之间 70% 处
  const fi = p * (SLIDE_COUNT - 1);
  const idx = Math.floor(fi); // 当前文字 index
  const next = Math.min(idx + 1, SLIDE_COUNT - 1); // 下一项 index（防越界）
  const frac = fi - idx; // 插值系数 0~1

  // 当前激活的背景图 index（略超前于文字，让切换更流畅）
  currentSlide.value = Math.min(Math.floor(p * SLIDE_COUNT), SLIDE_COUNT - 1);

  if (textCenters.length) {
    // 文字列表垂直滚动：让当前项始终在容器中央
    textY.value = textContainerH / 2 - (textCenters[idx] + (textCenters[next] - textCenters[idx]) * frac);
  }

  // GSAP 驱动缩略图动画
  updateThumbs(p);
}

onMounted(() => {
  // 创建 ScrollTrigger：滚动驱动轮播
  st = ScrollTrigger.create({
    trigger: ".section-2",
    start: "top top", // section 顶部触及视口顶部时开始
    end: "+=100%", // 初始滚动距离（后续由 recalc 动态调整）
    pin: true, // 钉住 section
    scrub: true, // 滚动同步（scrub 模式）
    pinSpacing: true, // 保留钉住后的占位空间
    invalidateOnRefresh: true, // resize 时重新计算
    snap: {
      // 滚动停止时吸附到最近的 slide
      snapTo: carouselSlides.map((_, i) => i / (SLIDE_COUNT - 1)),
      duration: 0.4,
      ease: "power2.out"
    },
    onUpdate(self) {
      setByProgress(self.progress);
    }
  });

  recalc();

  // 监听 resize，重新计算轨道参数与滚动距离
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

      <!-- 右侧：2D 圆形轨道缩略图（absolute 在 section 内） -->
      <div
        v-for="(slide, i) in carouselSlides"
        :key="'thumb-' + i"
        :ref="
          (el) => {
            thumbEls[i] = el as HTMLElement | null;
          }
        "
        class="absolute z-10 w-[100px] lg:w-[120px] h-[120px] lg:h-[90px] rounded-lg overflow-hidden cursor-pointer"
        style="left: 0; top: 0; border: 1px solid transparent"
      >
        <img :src="slide.thumb" alt="" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    </div>
  </section>
</template>
