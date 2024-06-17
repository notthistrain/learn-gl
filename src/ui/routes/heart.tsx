import { useEffect, useRef } from 'react'
import { use_webgpu, IEffectWrap } from '@/hook/use-webgpu'
import shader_code from '@/shader/heart.wgsl'

const floats_of_position = 2
const bytes_of_float = 4
const nums_of_triangle_indices = 3
const param_a = 0.05

const cos = Math.cos
const sin = Math.sin
const pow = Math.pow

/**
 * x = a * (1 - sinO) * cosO
 * y = a * (1 - sinO) * sinO
 * 
 * x = 16 * pow(sin(Angle), 3)
 * y = (13 * cos(Angle) - 5 * cos(2 * Angle) - 2 * cos(3 * Angle) - cos(4 * Angle))
 * 
 */
function create_heart_vertices() {
    const nums_of_subvision = 360
    // nums_of_subvision + 1 + 1(center_of_circle)
    const nums_of_vertices = nums_of_subvision + 1 + 1
    const vertex_data = new Float32Array(nums_of_vertices * floats_of_position)
    const index_data = new Uint32Array(nums_of_subvision * nums_of_triangle_indices)
    const angle_of_subvision = Math.PI * 2 / nums_of_subvision
    // center of circle
    let vertex_offset = 2
    for (let i = 1; i <= nums_of_vertices; i++) {
        const angle = angle_of_subvision * i

        // const x = param_a * (1 - sin(angle)) * cos(angle)
        // const y = param_a * (1 - sin(angle)) * sin(angle)

        const x = param_a * 16 * (pow(sin(angle), 3))
        const y = param_a * (13 * cos(angle) - 5 * cos(2 * angle) - 2 * cos(3 * angle) - cos(4 * angle))

        vertex_data[vertex_offset++] = x
        vertex_data[vertex_offset++] = y
    }
    let index_offset = 0
    for (let i = 1; i <= nums_of_subvision; i++) {
        index_data[index_offset++] = 0
        index_data[index_offset++] = i
        index_data[index_offset++] = i + 1
    }
    return { vertex_data, index_data }
}

async function render(canvas: HTMLCanvasElement, effect: IEffectWrap) {
    const { device, context, format, clean } = await use_webgpu(canvas, draw)
    effect.clean = clean
    context.configure({ device, format })

    const { vertex_data, index_data } = create_heart_vertices()
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

    const module = device.createShaderModule({ code: shader_code })
    const pipe_line = device.createRenderPipeline({
        label: 'heart render pipe line',
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'vertex_main',
            constants: {
                'aspect': canvas.width / canvas.height
            },
            buffers: [
                {
                    arrayStride: floats_of_position * bytes_of_float,
                    attributes: [
                        {
                            format: 'float32x2',
                            offset: 0,
                            shaderLocation: 0
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

    const translate_data = new Float32Array([0.0, 0.25])
    const translate_buffer = device.createBuffer({
        label: 'translate buffer',
        size: translate_data.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const bind_group = device.createBindGroup({
        label: 'heart bind group',
        layout: pipe_line.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: { buffer: translate_buffer }
            }
        ]
    })

    const render_pass_descriptor: GPURenderPassDescriptor = {
        label: 'heart render pass',
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: [1, 1, 1, 1]
            }
        ]
    }

    function draw() {
        const command_encoder = device.createCommandEncoder()
        for (const color_attachment of render_pass_descriptor.colorAttachments) {
            color_attachment.view = context.getCurrentTexture().createView()
        }
        const render_pass = command_encoder.beginRenderPass(render_pass_descriptor)
        render_pass.setPipeline(pipe_line)
        render_pass.setVertexBuffer(0, vertex_buffer)
        render_pass.setIndexBuffer(index_buffer, 'uint32')
        render_pass.setBindGroup(0, bind_group)
        render_pass.drawIndexed(index_data.length)
        render_pass.end()
        const command_buffer = command_encoder.finish()
        device.queue.submit([command_buffer])
    }
}

export const Heart = () => {
    const ref = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        let effect: IEffectWrap = {}
        if (ref.current) {
            render(ref.current, effect)
        }
        return () => effect.clean?.()
    }, [])

    return <canvas className=' w-full h-full' ref={ref}></canvas>
}