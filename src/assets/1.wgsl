    struct VertexShaderOutput
//  struct VertexShaderOutput
{
    @builtin(position) vertexPosition: vec4<f32>,
//  @builtin(position) vertexPosition: vec4<f32>,
    @location(0) uv: vec2<f32>,
//  @location(0) uv: vec2<f32>,
};



    struct FragmentShaderInput
//  struct FragmentShaderInput
{
    @builtin(position) fragmentPosition: vec4<f32>,
//  @builtin(position) fragmentPosition: vec4<f32>,
    @location(0) uv: vec2<f32>,
//  @location(0) uv: vec2<f32>,
};



    @vertex fn vertexShader(@builtin(vertex_index) vertexIndex : u32) -> VertexShaderOutput
//  @vertex fn vertexShader(@builtin(vertex_index) vertexIndex : u32) -> VertexShaderOutput
{
    let vertexPosition: array<vec4<f32>, 6> = array<vec4<f32>, 6>(
//  let vertexPosition: array<vec4<f32>, 6> = array<vec4<f32>, 6>(
        vec4<f32>(-1.0, -1.0,  0.0,  1.0),
//      vec4<f32>(-1.0, -1.0,  0.0,  1.0),
        vec4<f32>( 1.0, -1.0,  0.0,  1.0),
//      vec4<f32>( 1.0, -1.0,  0.0,  1.0),
        vec4<f32>(-1.0,  1.0,  0.0,  1.0),
//      vec4<f32>(-1.0,  1.0,  0.0,  1.0),
        vec4<f32>(-1.0,  1.0,  0.0,  1.0),
//      vec4<f32>(-1.0,  1.0,  0.0,  1.0),
        vec4<f32>( 1.0, -1.0,  0.0,  1.0),
//      vec4<f32>( 1.0, -1.0,  0.0,  1.0),
        vec4<f32>( 1.0,  1.0,  0.0,  1.0),
//      vec4<f32>( 1.0,  1.0,  0.0,  1.0),
    );

    let uv: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
//  let uv: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
    );

    var vertexShaderOutput: VertexShaderOutput;
//  var vertexShaderOutput: VertexShaderOutput;
    vertexShaderOutput.vertexPosition = vertexPosition[vertexIndex];
//  vertexShaderOutput.vertexPosition = vertexPosition[vertexIndex];
    vertexShaderOutput.uv = uv[vertexIndex];
//  vertexShaderOutput.uv = uv[vertexIndex];
    return vertexShaderOutput;
//  return vertexShaderOutput;
}



    @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
//  @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
{
    return vec4<f32>(fragmentShaderInput.uv, 0.0, 1.0);
//  return vec4<f32>(fragmentShaderInput.uv, 0.0, 1.0);
}
