struct VertexInput {
    @location(0) position: vec2f
};

struct VertexOuput {
    @builtin(position) position: vec4f,
}

@vertex
fn vertex_main(
    input: VertexInput
) -> VertexOuput {
    var output: VertexOuput;
    output.position = vec4f(input.position, 0.0, 1.0);
    return output;
}

@fragment
fn fragment_main(
    vert_ouput: VertexOuput
) -> @location(0) vec4f {
    return vec4f(0.8, 0.6, 0.1, 1.0);
}