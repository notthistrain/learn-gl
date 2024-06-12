import { useEffect, useRef } from 'react'
import { use_webgpu, IWebGpuCombine } from '@/hook/use-webgpu'
import shader_code from '@/shader/ring.wgsl'


const bytes_of_position = 2
const bytes_of_color = 1
const bytes_of_vertex = (bytes_of_position + bytes_of_color)
const bytes_of_triangle_indices = 3
const triangle_nums_of_subvision = 2
/** scalex scaley offsetx offsety rgb */
const bytes_of_scale = 2
const bytes_of_offset = 2
const bytes_of_changing = bytes_of_scale + bytes_of_offset
const bytes_of_input_item = bytes_of_changing + bytes_of_color
/** ring appearance */
const nums_of_subvision = 360
const nums_of_ring = 36

function rand(min?: number, max?: number) {
    if (min === undefined) {
        max = 1
        min = 0
    } else if (max === undefined) {
        max = min
        min = 0
    }
    return min + Math.random() * (max - min)
}

function create_circle_vertices(
    nums_of_subvision = 24,
    radius = 0.5,
    inner_radius = 0.25
) {

    const vertex_data = new Float32Array((nums_of_subvision + 1) * bytes_of_position * bytes_of_vertex)
    const index_data = new Uint32Array(nums_of_subvision * bytes_of_triangle_indices * triangle_nums_of_subvision)
    const color_data = new Uint8Array(vertex_data.buffer)
    let vertex_offset = 0
    let index_offset = 0
    let color_offset = bytes_of_position * 4

    function add_vertex(x: number, y: number, ...rgb: number[]) {
        vertex_data[vertex_offset++] = x
        vertex_data[vertex_offset++] = y
        vertex_offset++

        color_data[color_offset++] = rgb[0] * 255
        color_data[color_offset++] = rgb[1] * 255
        color_data[color_offset++] = rgb[2] * 255
        color_offset += bytes_of_position * 4 + 1
    }

    function add_index(i: number) {
        const triangle_offset = i * 2

        index_data[index_offset++] = triangle_offset
        index_data[index_offset++] = triangle_offset + 1
        index_data[index_offset++] = triangle_offset + 2

        index_data[index_offset++] = triangle_offset + 2
        index_data[index_offset++] = triangle_offset + 1
        index_data[index_offset++] = triangle_offset + 3
    }

    const subvision_angle = Math.PI * 2 / nums_of_subvision
    const inner_color: number[] = [1, 1, 1]
    const outer_color: number[] = [0.1, 0.1, 0.1]
    for (let i = 0; i <= nums_of_subvision; i++) {
        const angle = subvision_angle * i
        const x = Math.sin(angle)
        const y = Math.cos(angle)
        add_vertex(x * radius, y * radius, ...outer_color)
        add_vertex(x * inner_radius, y * inner_radius, ...inner_color)
        add_index(i)
    }

    return {
        vertex_data,
        index_data
    }
}

interface IEffectWrap {
    clean?: Function
}

async function render(canvas: HTMLCanvasElement, effect: IEffectWrap) {
    const { device, context, format } = await use_webgpu(canvas)
    context.configure({ device, format })

    const { vertex_data, index_data } = create_circle_vertices(nums_of_subvision, 0.3, 0.16)

    const module = device.createShaderModule({ code: shader_code })
    const vertex_buffer = device.createBuffer({
        label: 'vertex buffer',
        size: vertex_data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vertex_buffer, 0, vertex_data)

    const index_buffer = device.createBuffer({
        label: 'index buffer',
        size: index_data.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(index_buffer, 0, index_data)

    const input_vertex_data = new Float32Array(nums_of_ring * bytes_of_input_item)
    const input_vertex_buffer = device.createBuffer({
        label: 'changing vertex buffer',
        size: input_vertex_data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })

    const pipe_line = device.createRenderPipeline({
        label: 'ring render pipe line',
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'vertex_main',
            buffers: [
                {
                    arrayStride: bytes_of_vertex * 4,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x2'
                        },
                        {
                            shaderLocation: 1,
                            offset: bytes_of_position * 4,
                            format: 'unorm8x4'
                        }
                    ]
                },
                {
                    arrayStride: bytes_of_input_item * 4,
                    stepMode: 'instance',
                    attributes: [
                        {
                            shaderLocation: 2,
                            offset: 0,
                            format: 'float32x2'
                        },
                        {
                            shaderLocation: 3,
                            offset: bytes_of_scale * 4,
                            format: 'float32x2'
                        },
                        {
                            shaderLocation: 4,
                            offset: bytes_of_changing * 4,
                            format: 'unorm8x4'
                        }
                    ]
                }
            ]
        },
        fragment: {
            module,
            entryPoint: 'fragment_main',
            targets: [{ format }]
        }
    })

    const render_pass_descriptor: GPURenderPassDescriptor = {
        label: 'ring render pass',
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: [0.5, 0.5, 0.5, 1]
            }
        ]
    }

    function set_input_data() {
        const color_data_u8 = new Uint8Array(input_vertex_data.buffer)
        let changing_offset = 0
        let color_offset = bytes_of_changing * 4
        for (let i = 0; i < nums_of_ring; i++) {
            const scale = rand()
            /** set scale&offset data */
            input_vertex_data[changing_offset++] = scale
            input_vertex_data[changing_offset++] = scale * canvas.width / canvas.height
            input_vertex_data[changing_offset++] = rand(-1, 1)
            input_vertex_data[changing_offset++] = rand(-1, 1)
            changing_offset++
            /** set color data */
            color_data_u8[color_offset++] = rand() * 255
            color_data_u8[color_offset++] = rand() * 255
            color_data_u8[color_offset++] = rand() * 255
            color_offset += bytes_of_changing * 4 + 1
        }
        device.queue.writeBuffer(input_vertex_buffer, 0, input_vertex_data)
    }

    function draw() {
        set_input_data()
        const command_encoder = device.createCommandEncoder()
        for (const color_attachment of render_pass_descriptor.colorAttachments) {
            color_attachment.view = context.getCurrentTexture().createView()
        }
        const render_pass = command_encoder.beginRenderPass(render_pass_descriptor)
        render_pass.setPipeline(pipe_line)
        render_pass.setVertexBuffer(0, vertex_buffer)
        render_pass.setVertexBuffer(1, input_vertex_buffer)
        render_pass.setIndexBuffer(index_buffer, 'uint32')
        render_pass.drawIndexed(index_data.length, nums_of_ring)
        render_pass.end()
        const command_buffer = command_encoder.finish()
        device.queue.submit([command_buffer])
    }

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

    effect.clean = () => {
        device.destroy()
        context.unconfigure()
        observer.disconnect()
        removeEventListener('message', on_message)
    }
}

export function Ring() {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        let effect: IEffectWrap = {}
        if (ref.current) {
            render(ref.current, effect)
        }
        return () => {
            effect.clean?.()
        }
    }, [])

    return <canvas className=' w-full h-full' ref={ref}></canvas>
}