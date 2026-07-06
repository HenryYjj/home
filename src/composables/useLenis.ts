// composables/useLenis.ts
// Lenis - 平滑滚动插件，让页面滚动更丝滑
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import Lenis from 'lenis'

// Lenis 配置选项的接口定义
interface LenisOptions {
    duration?: number                     // 滚动持续时间（秒）
    easing?: (t: number) => number        // 自定义缓动函数
    orientation?: 'vertical' | 'horizontal'  // 滚动方向
    smoothWheel?: boolean                 // 是否启用鼠标滚轮平滑滚动
    wheelMultiplier?: number              // 滚轮滚动速度倍率
    touchMultiplier?: number              // 触摸滚动速度倍率
}

export function useLenis(options: LenisOptions = {}) {
    const lenis = ref<Lenis | null>(null)      // Lenis 实例
    const isScrolling = ref(false)              // 是否正在滚动中
    const scrollProgress = ref(0)               // 滚动进度（0 ~ 1）

    // 默认配置
    const defaultOptions = {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // 缓动：开始慢中间快结束慢
        orientation: 'vertical' as const,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    }

    onMounted(() => {
        // 创建 Lenis 实例，合并默认配置和用户传入的配置
        lenis.value = new Lenis({
            ...defaultOptions,
            ...options,
        })

        // 监听滚动事件，更新滚动状态
        lenis.value.on('scroll', (e: any) => {
            isScrolling.value = true
            scrollProgress.value = e.progress

            // 滚动停止 200ms 后将 isScrolling 重置为 false
            clearTimeout((lenis.value as any)._scrollTimeout)
            ; (lenis.value as any)._scrollTimeout = setTimeout(() => {
                isScrolling.value = false
            }, 200)
        })

        // RAF 动画循环：让 Lenis 持续处理平滑滚动计算
        function raf(time: number) {
            lenis.value?.raf(time)               // 通知 Lenis 更新
            requestAnimationFrame(raf)           // 请求下一帧
        }
        requestAnimationFrame(raf)
    })

    onUnmounted(() => {
        lenis.value?.destroy()                   // 组件销毁时清理 Lenis 实例
        lenis.value = null
    })

    // ===== 工具方法 =====
    const scrollTo = (target: string | number | HTMLElement, offset?: number) => {
        lenis.value?.scrollTo(target, { offset })
    }

    const scrollToTop = () => {
        lenis.value?.scrollTo(0, { immediate: false })
    }

    const stop = () => lenis.value?.stop()       // 暂停滚动
    const start = () => lenis.value?.start()     // 恢复滚动

    return {
        lenis,          // Lenis 实例
        isScrolling,    // 是否正在滚动（响应式数据）
        scrollProgress, // 滚动进度 0~1（响应式数据）
        scrollTo,       // 滚动到指定位置
        scrollToTop,    // 滚动到顶部
        stop,           // 暂停平滑滚动
        start,          // 恢复平滑滚动
    }
}