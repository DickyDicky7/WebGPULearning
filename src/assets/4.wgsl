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



    struct StaticInput
//  struct StaticInput
{
    color: vec4<f32>,
//  color: vec4<f32>,
    offset: vec2<f32>,
//  offset: vec2<f32>,
};



    struct DynamicInput
//  struct DynamicInput
{
    scale: vec2<f32>,
//  scale: vec2<f32>,
};



    struct Vertex
//  struct Vertex
{
    position: vec2<f32>,
//  position: vec2<f32>,
};



    @group(0) @binding(0) var<storage, read> staticInputs: array<StaticInput>;
//  @group(0) @binding(0) var<storage, read> staticInputs: array<StaticInput>;
    @group(0) @binding(1) var<storage, read> dynamicInputs: array<DynamicInput>;
//  @group(0) @binding(1) var<storage, read> dynamicInputs: array<DynamicInput>;
    @group(0) @binding(2) var<storage, read> vertices: array<Vertex>;
//  @group(0) @binding(2) var<storage, read> vertices: array<Vertex>;



    @vertex fn vertexShader(@builtin(vertex_index) vertexIndex : u32, @builtin(instance_index) instanceIndex: u32) -> VertexShaderOutput
//  @vertex fn vertexShader(@builtin(vertex_index) vertexIndex : u32, @builtin(instance_index) instanceIndex: u32) -> VertexShaderOutput
{
    let staticInput: StaticInput = staticInputs[instanceIndex];
//  let staticInput: StaticInput = staticInputs[instanceIndex];
    let dynamicInput: DynamicInput = dynamicInputs[instanceIndex];
//  let dynamicInput: DynamicInput = dynamicInputs[instanceIndex];
    let vertex: Vertex = vertices[vertexIndex];
//  let vertex: Vertex = vertices[vertexIndex];

    var vertexShaderOutput: VertexShaderOutput;
//  var vertexShaderOutput: VertexShaderOutput;
    vertexShaderOutput.vertexPosition = vec4<f32>(vertex.position * dynamicInput.scale + staticInput.offset, 0.0, 1.0);
//  vertexShaderOutput.vertexPosition = vec4<f32>(vertex.position * dynamicInput.scale + staticInput.offset, 0.0, 1.0);
    vertexShaderOutput.color = staticInput.color;
//  vertexShaderOutput.color = staticInput.color;
    return vertexShaderOutput;
//  return vertexShaderOutput;
}



    @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
//  @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
{
    return fragmentShaderInput.color;
//  return fragmentShaderInput.color;
}
