    struct VertexShaderInput
//  struct VertexShaderInput
{
    @builtin(vertex_index) vertexIndex: u32,
//  @builtin(vertex_index) vertexIndex: u32,
}

    struct VertexShaderOutput
//  struct VertexShaderOutput
{
    @builtin(position) vertexPosition: vec4<f32>,
//  @builtin(position) vertexPosition: vec4<f32>,
    @location(0) uv: vec2<f32>,
//  @location(0) uv: vec2<f32>,
}

    struct FragmentShaderInput
//  struct FragmentShaderInput
{
    @builtin(position) fragmentPosition: vec4<f32>,
//  @builtin(position) fragmentPosition: vec4<f32>,
    @location(0) uv: vec2<f32>,
//  @location(0) uv: vec2<f32>,
}

    struct FragmentShaderOutput
//  struct FragmentShaderOutput
{
    @location(0) fragmentColor: vec4<f32>,
//  @location(0) fragmentColor: vec4<f32>,
}

    struct GeneralData
//  struct GeneralData
{
    canvasSize: vec2<u32>,
//  canvasSize: vec2<u32>,
    stratifiedSamplesPerPixel: f32,
//  stratifiedSamplesPerPixel: f32,
    inverseStratifiedSamplesPerPixel: f32,
//  inverseStratifiedSamplesPerPixel: f32,
    cameraCenter: vec3<f32>,
//  cameraCenter: vec3<f32>,
    pixelSamplesScale: f32,
//  pixelSamplesScale: f32,
    fromPixelToPixelDeltaU: vec3<f32>,
//  fromPixelToPixelDeltaU: vec3<f32>,
    stratifiedSampleX: f32,
//  stratifiedSampleX: f32,
    fromPixelToPixelDeltaV: vec3<f32>,
//  fromPixelToPixelDeltaV: vec3<f32>,
    stratifiedSampleY: f32,
//  stratifiedSampleY: f32,
    pixel00Coordinates: vec3<f32>,
//  pixel00Coordinates: vec3<f32>,
    backgroundType: u32,
//  backgroundType: u32,
    numberOfImages: u32,
//  numberOfImages: u32,
    timeInSeconds: f32,
//  timeInSeconds: f32,
    accumulatedSampleCount: u32,
//  accumulatedSampleCount: u32,
    defocusDiskRadiusU: vec3<f32>,
//  defocusDiskRadiusU: vec3<f32>,
    defocusDiskRadiusV: vec3<f32>,
//  defocusDiskRadiusV: vec3<f32>,
}

    const vertexPosition: array<vec4<f32>, 6> = array<vec4<f32>, 6>(
//  const vertexPosition: array<vec4<f32>, 6> = array<vec4<f32>, 6>(
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
//  );

    const uv: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
//  const uv: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 1.0),
//      vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 1.0),
//      vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0),
//      vec2<f32>(0.0, 0.0),
        vec2<f32>(0.0, 0.0),
//      vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 1.0),
//      vec2<f32>(1.0, 1.0),
        vec2<f32>(1.0, 0.0),
//      vec2<f32>(1.0, 0.0),
    );
//  );

    @group(0) @binding(0) var blurSampler: sampler;
//  @group(0) @binding(0) var blurSampler: sampler;
    @group(0) @binding(1) var blurTexture: texture_2d<f32>;
//  @group(0) @binding(1) var blurTexture: texture_2d<f32>;
    @group(0) @binding(2) var<uniform> generalData: GeneralData;
//  @group(0) @binding(2) var<uniform> generalData: GeneralData;

    @vertex fn vertexShader(vertexShaderInput: VertexShaderInput) -> VertexShaderOutput
//  @vertex fn vertexShader(vertexShaderInput: VertexShaderInput) -> VertexShaderOutput
{
    var vertexShaderOutput: VertexShaderOutput;
//  var vertexShaderOutput: VertexShaderOutput;
    vertexShaderOutput.vertexPosition = vertexPosition[vertexShaderInput.vertexIndex];
//  vertexShaderOutput.vertexPosition = vertexPosition[vertexShaderInput.vertexIndex];
    vertexShaderOutput.uv = uv[vertexShaderInput.vertexIndex];
//  vertexShaderOutput.uv = uv[vertexShaderInput.vertexIndex];
    return vertexShaderOutput;
//  return vertexShaderOutput;
}

    @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> FragmentShaderOutput
//  @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> FragmentShaderOutput
{
    var fragmentShaderOutput: FragmentShaderOutput;
//  var fragmentShaderOutput: FragmentShaderOutput;
    let uv: vec2<f32> = fragmentShaderInput.uv;
//  let uv: vec2<f32> = fragmentShaderInput.uv;
    var color: vec4<f32> = vec4<f32>(0.0);
//  var color: vec4<f32> = vec4<f32>(0.0);
    for (var i: f32 = -2.0; i <= 2.0; i += 1.0) {
//  for (var i: f32 = -2.0; i <= 2.0; i += 1.0) {
    for (var j: f32 = -2.0; j <= 2.0; j += 1.0) {
//  for (var j: f32 = -2.0; j <= 2.0; j += 1.0) {
        color += textureSample(blurTexture, blurSampler, uv + vec2<f32>(i, j) * 2.0 / vec2<f32>(generalData.canvasSize.xy));
//      color += textureSample(blurTexture, blurSampler, uv + vec2<f32>(i, j) * 2.0 / vec2<f32>(generalData.canvasSize.xy));
    }
//  }
    }
//  }
    color /= 25.0;
//  color /= 25.0;
    fragmentShaderOutput.fragmentColor = color;
//  fragmentShaderOutput.fragmentColor = color;
    return fragmentShaderOutput;
//  return fragmentShaderOutput;
}
