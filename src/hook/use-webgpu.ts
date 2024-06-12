export interface IWebGpuCombine {
    adapter: GPUAdapter
    device: GPUDevice
    context: GPUCanvasContext
    format: GPUTextureFormat
}

export async function use_webgpu(canvas: HTMLCanvasElement): Promise<IWebGpuCombine> {
    const adapter = await navigator.gpu.requestAdapter({})
    const device = await adapter!.requestDevice()
    const context = canvas.getContext('webgpu')
    const format = navigator.gpu.getPreferredCanvasFormat()
    return {
        adapter,
        device,
        context,
        format
    }
}