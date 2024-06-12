struct Vertex {
    @location(0) position: vec2f,
    @location(1) per_ring_color: vec4f,
    @location(2) scale: vec2f,
    @location(3) offset: vec2f,
    @location(4) color: vec4f
};

struct VsOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex_main(
    vert: Vertex,
) -> VsOutput {
    var output: VsOutput;
    output.position = vec4f(vert.position * vert.scale + vert.offset, 0.0, 1.0);
    output.color = vert.color * vert.per_ring_color;
    return output;
}

@fragment
fn fragment_main(vsOut: VsOutput) -> @location(0) vec4f {
    return vsOut.color;
}