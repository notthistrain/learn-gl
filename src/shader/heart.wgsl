struct VertexInput {
    @location(0) position: vec2f
};

struct VertexOuput {
    @builtin(position) position: vec4f,
}

@group(0) @binding(0) var<uniform> translate: vec2f;

const scale = 0.5;
override aspect: f32 = 1;

@vertex
fn vertex_main(
    input: VertexInput
) -> VertexOuput {
    var output: VertexOuput;
    output.position = vec4f((input.position * vec2f(scale, scale * aspect)) + translate, 0.0, 1.0);
    return output;
}

@fragment
fn fragment_main(
    vert_ouput: VertexOuput
) -> @location(0) vec4f {
    return vec4f(0.8, 0.6, 0.1, 1.0);
}