// composables/useLenis.ts
import { ref, onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface LenisOptions {
    duration?: number
    easing?: (t: number) => number
    orientation?: 'vertical' | 'horizontal'
    smoothWheel?: boolean
    wheelMultiplier?: number
    touchMultiplier?: number
}

export function useLenis(options: LenisOptions = {}) {
    const lenis = ref<Lenis | null>(null)
    const isScrolling = ref(false)
    const scrollProgress = ref(0)

    const defaultOptions = {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical' as const,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    }

    onMounted(() => {
        // 初始化 Lenis
        lenis.value = new Lenis({
            ...defaultOptions,
            ...options,
        })

        // 监听滚动事件
        lenis.value.on('scroll', (e: any) => {
            isScrolling.value = true
            scrollProgress.value = e.progress
            
            // 同步滚动到 ScrollTrigger
            ScrollTrigger.update()

            // 滚动结束后重置状态
            clearTimeout((lenis.value as any)._scrollTimeout)
                ; (lenis.value as any)._scrollTimeout = setTimeout(() => {
                    isScrolling.value = false
                }, 200)
        })

       /*  // 配置 ScrollTrigger 使用 Lenis
        ScrollTrigger.scrollerProxy('body', {
            scrollTop(value) {
                if (arguments.length) {
                    lenis.value?.scrollTo(value as number, { immediate: true })
                }
                return lenis.value?.scroll || 0
            },
            pinType: 'transform',
        }) */

        // RAF 动画循环
        function raf(time: number) {
            lenis.value?.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)
    })

    onUnmounted(() => {
        lenis.value?.destroy()
        lenis.value = null
    })

    // 工具方法
    const scrollTo = (target: string | number | HTMLElement, offset?: number) => {
        lenis.value?.scrollTo(target, { offset })
    }

    const scrollToTop = () => {
        lenis.value?.scrollTo(0, { immediate: false })
    }

    const stop = () => lenis.value?.stop()
    const start = () => lenis.value?.start()

    return {
        lenis,          // Lenis 实例
        isScrolling,    // 是否正在滚动（响应式）
        scrollProgress, // 滚动进度 0-1（响应式）
        scrollTo,
        scrollToTop,
        stop,
        start,
    }
}