export interface IWebGpuCombine {
    adapter: GPUAdapter
    device: GPUDevice
    context: GPUCanvasContext
    format: GPUTextureFormat
    clean: () => void
}

export interface IEffectWrap {
    clean?: Function
}

export async function use_webgpu(canvas: HTMLCanvasElement, draw: () => void): Promise<IWebGpuCombine> {
    const adapter = await navigator.gpu.requestAdapter({})
    const device = await adapter!.requestDevice()
    const context = canvas.getContext('webgpu')
    const format = navigator.gpu.getPreferredCanvasFormat()

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target as HTMLCanvasElement
            const width = entry.contentBoxSize[0].inlineSize
            const height = entry.contentBoxSize[0].blockSize
            canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D))
            canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D))
            draw()
        }
    })
    observer.observe(canvas)

    const on_message = (e: MessageEvent) => {
        if (e.data === 'render') {
            draw()
        }
    }
    addEventListener('message', on_message)

    return {
        adapter,
        device,
        context,
        format,
        clean: () => {
            device.destroy()
            context.unconfigure()
            observer.disconnect()
            removeEventListener('message', on_message)
        }
    }
}