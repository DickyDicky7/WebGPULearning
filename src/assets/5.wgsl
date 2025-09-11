    struct VertexShaderOutput
//  struct VertexShaderOutput
{
    @builtin(position) vertexPosition: vec4<f32>,
//  @builtin(position) vertexPosition: vec4<f32>,
    @location(0) color: vec4<f32>,
//  @location(0) color: vec4<f32>,
};



    struct FragmentShaderInput
//  struct FragmentShaderInput
{
    @builtin(position) fragmentPosition: vec4<f32>,
//  @builtin(position) fragmentPosition: vec4<f32>,
    @location(0) color: vec4<f32>,
//  @location(0) color: vec4<f32>,
};



    struct Vertex
//  struct Vertex
{
    @location(0) position: vec2<f32>,
//  @location(0) position: vec2<f32>,
    @location(1) color: vec4<f32>,
//  @location(1) color: vec4<f32>,
    @location(2) offset: vec2<f32>,
//  @location(2) offset: vec2<f32>,
    @location(3) scale: vec2<f32>,
//  @location(3) scale: vec2<f32>,
    @location(4) perVertexColor: vec3<f32>,
//  @location(4) perVertexColor: vec3<f32>,
};



    @vertex fn vertexShader(vertex: Vertex) -> VertexShaderOutput
//  @vertex fn vertexShader(vertex: Vertex) -> VertexShaderOutput
{
    var vertexShaderOutput: VertexShaderOutput;
//  var vertexShaderOutput: VertexShaderOutput;
    vertexShaderOutput.vertexPosition = vec4<f32>(vertex.position * vertex.scale + vertex.offset, 0.0, 1.0);
//  vertexShaderOutput.vertexPosition = vec4<f32>(vertex.position * vertex.scale + vertex.offset, 0.0, 1.0);
    vertexShaderOutput.color = vertex.color * vec4<f32>(vertex.perVertexColor, 1.0);
//  vertexShaderOutput.color = vertex.color * vec4<f32>(vertex.perVertexColor, 1.0);
    return vertexShaderOutput;
//  return vertexShaderOutput;
}



    @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
//  @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
{
    return fragmentShaderInput.color;
//  return fragmentShaderInput.color;
}
