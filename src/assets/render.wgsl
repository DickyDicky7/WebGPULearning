    enable f16;
//  enable f16;

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

    const INV_SQRT_OF_2PI: f32 = 0.39894228040143267793994605993439;
//  const INV_SQRT_OF_2PI: f32 = 0.39894228040143267793994605993439;
    const INV_PI         : f32 = 0.31830988618379067153776752674503;
//  const INV_PI         : f32 = 0.31830988618379067153776752674503;

    @group(0) @binding(0) var outputSampler: sampler;
//  @group(0) @binding(0) var outputSampler: sampler;
    @group(0) @binding(1) var outputTexture: texture_2d<f32>;
//  @group(0) @binding(1) var outputTexture: texture_2d<f32>;
    @group(0) @binding(2) var<uniform> generalData: GeneralData;
//  @group(0) @binding(2) var<uniform> generalData: GeneralData;
    @group(0) @binding(3) var blurSampler: sampler;
//  @group(0) @binding(3) var blurSampler: sampler;
    @group(0) @binding(4) var blurTexture: texture_2d<f32>;
//  @group(0) @binding(4) var blurTexture: texture_2d<f32>;

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

    // center-based offset so effect radiates from center
//  // center-based offset so effect radiates from center
    let center: vec2<f32> = vec2<f32>(0.5, 0.5);
//  let center: vec2<f32> = vec2<f32>(0.5, 0.5);
    let direction: vec2<f32> = fragmentShaderInput.uv - center;
//  let direction: vec2<f32> = fragmentShaderInput.uv - center;

//     // direction-scaled offset (so corners shift more)
// //  // direction-scaled offset (so corners shift more)
//     let offset: vec2<f32> = direction * 0.01;
// //  let offset: vec2<f32> = direction * 0.01;

//     // optionally curve the offset with a power for nicer falloff
// //  // optionally curve the offset with a power for nicer falloff
//     let powFactor: f32 = pow(length(direction) * 2.0, 1.0); // small non-linear boost
// //  let powFactor: f32 = pow(length(direction) * 2.0, 1.0); // small non-linear boost
//     let finalOffset: vec2<f32> = offset * powFactor;
// //  let finalOffset: vec2<f32> = offset * powFactor;

//     // sample channels: red shifted one way, blue opposite, green centered
// //  // sample channels: red shifted one way, blue opposite, green centered
//     let uvR: vec2<f32> = fragmentShaderInput.uv + finalOffset * (0.5 + 0.1);
// //  let uvR: vec2<f32> = fragmentShaderInput.uv + finalOffset * (0.5 + 0.1);
//     let uvG: vec2<f32> = fragmentShaderInput.uv;
// //  let uvG: vec2<f32> = fragmentShaderInput.uv;
//     let uvB: vec2<f32> = fragmentShaderInput.uv - finalOffset * (0.5 + 0.1);
// //  let uvB: vec2<f32> = fragmentShaderInput.uv - finalOffset * (0.5 + 0.1);

//     // Sample texture (textureSample clamps or wraps depending on sampler)
// //  // Sample texture (textureSample clamps or wraps depending on sampler)
//     let colorR: vec4<f32> = textureSample(outputTexture, outputSampler, uvR);
// //  let colorR: vec4<f32> = textureSample(outputTexture, outputSampler, uvR);
//     let colorG: vec4<f32> = textureSample(outputTexture, outputSampler, uvG);
// //  let colorG: vec4<f32> = textureSample(outputTexture, outputSampler, uvG);
//     let colorB: vec4<f32> = textureSample(outputTexture, outputSampler, uvB);
// //  let colorB: vec4<f32> = textureSample(outputTexture, outputSampler, uvB);

//     // Compose RGB from separate samples; keep alpha from green
// //  // Compose RGB from separate samples; keep alpha from green
//     var baseColor: vec3<f32> = vec3<f32>(colorR.r, colorG.g, colorB.b);
// //  var baseColor: vec3<f32> = vec3<f32>(colorR.r, colorG.g, colorB.b);
    var baseColor: vec3<f32> = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv).rgb;
//  var baseColor: vec3<f32> = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv).rgb;
    let blur: vec4<f16> = vec4<f16>(textureSample(blurTexture, blurSampler, fragmentShaderInput.uv));
//  let blur: vec4<f16> = vec4<f16>(textureSample(blurTexture, blurSampler, fragmentShaderInput.uv));
    let bloom: vec3<f16> = blur.rgb / blur.w;
//  let bloom: vec3<f16> = blur.rgb / blur.w;
    baseColor += vec3<f32>(0.0h * bloom);
//  baseColor += vec3<f32>(0.0h * bloom);

    var outputColor: vec3<f32> = _vec3LinearToGamma(_tonemapReinhard(baseColor));
//  var outputColor: vec3<f32> = _vec3LinearToGamma(_tonemapReinhard(baseColor));

    // ---- Correct VIGNETTE ----
//  // ---- Correct VIGNETTE ----
    let distance: f32 = length(direction); // distance from center (0..~0.7 on screen)
//  let distance: f32 = length(direction); // distance from center (0..~0.7 on screen)
    let vignetteRadius: f32 = 0.9; // how far before darkening starts
//  let vignetteRadius: f32 = 0.9; // how far before darkening starts
    let vignetteSoftness: f32 = 0.5; // how smooth the fade is
//  let vignetteSoftness: f32 = 0.5; // how smooth the fade is
    // fade from center (1.0) to edge (0.0)
//  // fade from center (1.0) to edge (0.0)
    let vignette: f32 = smoothstep(vignetteRadius, vignetteRadius - vignetteSoftness, distance);
//  let vignette: f32 = smoothstep(vignetteRadius, vignetteRadius - vignetteSoftness, distance);
    outputColor *= vignette;
//  outputColor *= vignette;

    // Optional gamma correction
//  // Optional gamma correction
    // outputColor = pow(outputColor, vec3<f32>(1.0 / 2.2));
//  // outputColor = pow(outputColor, vec3<f32>(1.0 / 2.2));

    fragmentShaderOutput.fragmentColor = vec4<f32>(outputColor, 1.0);
//  fragmentShaderOutput.fragmentColor = vec4<f32>(outputColor, 1.0);
//     fragmentShaderOutput.fragmentColor = vec4<f32>(_vec3LinearToGamma(_tonemapACES(_smartDeNoise(outputTexture, outputSampler, fragmentShaderInput.uv, 5.0, 2.0, 0.1).rgb)), 1.0);
// //  fragmentShaderOutput.fragmentColor = vec4<f32>(_vec3LinearToGamma(_tonemapACES(_smartDeNoise(outputTexture, outputSampler, fragmentShaderInput.uv, 5.0, 2.0, 0.1).rgb)), 1.0);
//     fragmentShaderOutput.fragmentColor = vec4<f32>(_vec3LinearToGamma(_tonemapACES(_screenSpaceVolumetricLighting(outputTexture, outputSampler, fragmentShaderInput.uv, vec2<f32>(0.5, 0.5)).rgb)), 1.0);
// //  fragmentShaderOutput.fragmentColor = vec4<f32>(_vec3LinearToGamma(_tonemapACES(_screenSpaceVolumetricLighting(outputTexture, outputSampler, fragmentShaderInput.uv, vec2<f32>(0.5, 0.5)).rgb)), 1.0);
    var lluv: vec2<f32> = fragmentShaderInput.uv - 0.5;
//  var lluv: vec2<f32> = fragmentShaderInput.uv - 0.5;
    var lllp: vec2<f32> = vec2<f32>(0.00 , 0.00) - 0.5;
//  var lllp: vec2<f32> = vec2<f32>(0.00 , 0.00) - 0.5;
    let ratio: f32 = f32(generalData.canvasSize.x) / f32(generalData.canvasSize.y);
//  let ratio: f32 = f32(generalData.canvasSize.x) / f32(generalData.canvasSize.y);
    lluv.x *= ratio;
//  lluv.x *= ratio;
    lllp.x *= ratio;
//  lllp.x *= ratio;
    fragmentShaderOutput.fragmentColor = vec4<f32>(mix(fragmentShaderOutput.fragmentColor.rgb,
//  fragmentShaderOutput.fragmentColor = vec4<f32>(mix(fragmentShaderOutput.fragmentColor.rgb,
        _lensFlares(lluv * 1.5, lllp * 1.5, false, true, vec3<f32>(0.643, 0.494, 0.867), 6.0), 0.0), 1.0);
//      _lensFlares(lluv * 1.5, lllp * 1.5, false, true, vec3<f32>(0.643, 0.494, 0.867), 6.0), 0.0), 1.0);






/*
    fragmentShaderOutput.fragmentColor = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv);
//  fragmentShaderOutput.fragmentColor = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv);
*/






/*
    let rgb: vec3<f32> = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv).rgb;
//  let rgb: vec3<f32> = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv).rgb;
    fragmentShaderOutput.fragmentColor = vec4<f32>(_vec3LinearToGamma(_tonemapACES(rgb)), 1.0);
//  fragmentShaderOutput.fragmentColor = vec4<f32>(_vec3LinearToGamma(_tonemapACES(rgb)), 1.0);
*/






    return fragmentShaderOutput;
//  return fragmentShaderOutput;
}

    fn _smartDeNoise(tex: texture_2d<f32>, sam: sampler, uv: vec2<f32>, sigma: f32, kSigma: f32, threshold: f32) -> vec4<f32>
//  fn _smartDeNoise(tex: texture_2d<f32>, sam: sampler, uv: vec2<f32>, sigma: f32, kSigma: f32, threshold: f32) -> vec4<f32>
    {
        let radius: f32 = round(kSigma * sigma);
//      let radius: f32 = round(kSigma * sigma);
        let radQ  : f32 =       radius * radius;
//      let radQ  : f32 =       radius * radius;

        let invSigmaQx2  : f32 = 0.5 / (sigma * sigma);
//      let invSigmaQx2  : f32 = 0.5 / (sigma * sigma);
        let invSigmaQx2PI: f32 = INV_PI * invSigmaQx2 ;
//      let invSigmaQx2PI: f32 = INV_PI * invSigmaQx2 ;

        let invThresholdSqx2   : f32 = 0.5 / (threshold * threshold);
//      let invThresholdSqx2   : f32 = 0.5 / (threshold * threshold);
        let invThresholdSqrt2PI: f32 =  INV_SQRT_OF_2PI / threshold ;
//      let invThresholdSqrt2PI: f32 =  INV_SQRT_OF_2PI / threshold ;

        let centrPx: vec4<f32> = textureSample(tex, sam, uv);
//      let centrPx: vec4<f32> = textureSample(tex, sam, uv);

        var zBuff:       f32 =           0.0 ;
//      var zBuff:       f32 =           0.0 ;
        var aBuff: vec4<f32> = vec4<f32>(0.0);
//      var aBuff: vec4<f32> = vec4<f32>(0.0);
        let size : vec2<f32> = vec2<f32>(textureDimensions(tex, 0));
//      let size : vec2<f32> = vec2<f32>(textureDimensions(tex, 0));

        for (var x: f32 = -radius; x <= radius; x += 1.0)
//      for (var x: f32 = -radius; x <= radius; x += 1.0)
        {
            let pt: f32 = sqrt(radQ - x * x);
//          let pt: f32 = sqrt(radQ - x * x);
            for (var y: f32 = -pt; y <= pt; y += 1.0)
//          for (var y: f32 = -pt; y <= pt; y += 1.0)
            {
                let d: vec2<f32> = vec2<f32>(x, y);
//              let d: vec2<f32> = vec2<f32>(x, y);

                let blurFactor: f32 = exp(-dot(d, d) * invSigmaQx2) * invSigmaQx2PI;
//              let blurFactor: f32 = exp(-dot(d, d) * invSigmaQx2) * invSigmaQx2PI;

                let walkPx: vec4<f32> = textureSample(tex, sam, uv + d / size);
//              let walkPx: vec4<f32> = textureSample(tex, sam, uv + d / size);

                let dC: vec4<f32> = walkPx - centrPx;
//              let dC: vec4<f32> = walkPx - centrPx;
                let deltaFactor: f32 = exp(-dot(dC, dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;
//              let deltaFactor: f32 = exp(-dot(dC, dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;

                zBuff += deltaFactor         ;
//              zBuff += deltaFactor         ;
                aBuff += deltaFactor * walkPx;
//              aBuff += deltaFactor * walkPx;
            }
        }
        return aBuff / zBuff;
//      return aBuff / zBuff;
    }

    fn _vec4LinearToGamma(value: vec4<f32>) -> vec4<f32> { return sqrt(value); }
//  fn _vec4LinearToGamma(value: vec4<f32>) -> vec4<f32> { return sqrt(value); }
    fn _vec4GammaToLinear(value: vec4<f32>) -> vec4<f32> { return value * value; }
//  fn _vec4GammaToLinear(value: vec4<f32>) -> vec4<f32> { return value * value; }
    fn _vec3LinearToGamma(value: vec3<f32>) -> vec3<f32> { return sqrt(value); }
//  fn _vec3LinearToGamma(value: vec3<f32>) -> vec3<f32> { return sqrt(value); }
    fn _vec3GammaToLinear(value: vec3<f32>) -> vec3<f32> { return value * value; }
//  fn _vec3GammaToLinear(value: vec3<f32>) -> vec3<f32> { return value * value; }
    fn _vec2LinearToGamma(value: vec2<f32>) -> vec2<f32> { return sqrt(value); }
//  fn _vec2LinearToGamma(value: vec2<f32>) -> vec2<f32> { return sqrt(value); }
    fn _vec2GammaToLinear(value: vec2<f32>) -> vec2<f32> { return value * value; }
//  fn _vec2GammaToLinear(value: vec2<f32>) -> vec2<f32> { return value * value; }
    fn _f32LinearToGamma(value: f32) -> f32 { return sqrt(value); }
//  fn _f32LinearToGamma(value: f32) -> f32 { return sqrt(value); }
    fn _f32GammaToLinear(value: f32) -> f32 { return value * value; }
//  fn _f32GammaToLinear(value: f32) -> f32 { return value * value; }

    /*
    fn _f32Saturate(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }
//  fn _f32Saturate(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }
    fn _vec2Saturate(value: vec2<f32>) -> vec2<f32> { return clamp(value, vec2<f32>(0.0), vec2<f32>(1.0)); }
//  fn _vec2Saturate(value: vec2<f32>) -> vec2<f32> { return clamp(value, vec2<f32>(0.0), vec2<f32>(1.0)); }
    fn _vec3Saturate(value: vec3<f32>) -> vec3<f32> { return clamp(value, vec3<f32>(0.0), vec3<f32>(1.0)); }
//  fn _vec3Saturate(value: vec3<f32>) -> vec3<f32> { return clamp(value, vec3<f32>(0.0), vec3<f32>(1.0)); }
    fn _vec4Saturate(value: vec4<f32>) -> vec4<f32> { return clamp(value, vec4<f32>(0.0), vec4<f32>(1.0)); }
//  fn _vec4Saturate(value: vec4<f32>) -> vec4<f32> { return clamp(value, vec4<f32>(0.0), vec4<f32>(1.0)); }
    */

    fn _tonemapACES(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapACES(value: vec3<f32>) -> vec3<f32>
    {
        return saturate((value * (2.51 * value + vec3<f32>(0.03, 0.03, 0.03))) / (value * (2.43 * value + vec3<f32>(0.59, 0.59, 0.59)) + vec3<f32>(0.14, 0.14, 0.14)));
//      return saturate((value * (2.51 * value + vec3<f32>(0.03, 0.03, 0.03))) / (value * (2.43 * value + vec3<f32>(0.59, 0.59, 0.59)) + vec3<f32>(0.14, 0.14, 0.14)));
    }
    fn _tonemapFilmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapFilmic(value: vec3<f32>) -> vec3<f32>
    {
        let m: vec3<f32> = vec3<f32>(max(0.0, value.x - 0.004), max(0.0, value.y - 0.004), max(0.0, value.z - 0.004));
//      let m: vec3<f32> = vec3<f32>(max(0.0, value.x - 0.004), max(0.0, value.y - 0.004), max(0.0, value.z - 0.004));
        return (m * (6.2 * m + vec3<f32>(0.5, 0.5, 0.5))) / (m * (6.2 * m + vec3<f32>(1.7, 1.7, 1.7)) + vec3<f32>(0.06, 0.06, 0.06));
//      return (m * (6.2 * m + vec3<f32>(0.5, 0.5, 0.5))) / (m * (6.2 * m + vec3<f32>(1.7, 1.7, 1.7)) + vec3<f32>(0.06, 0.06, 0.06));
    }
    fn _tonemapReinhard(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapReinhard(value: vec3<f32>) -> vec3<f32>
    {
        return value / (1.0 + dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)));
//      return value / (1.0 + dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)));
    }
    fn _tonemapReinhardJodie(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapReinhardJodie(value: vec3<f32>) -> vec3<f32>
    {
        let l: f32 = dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)); let tc: vec3<f32> = value / (value + vec3<f32>(1.0, 1.0, 1.0)); return mix(value / (l + 1.0), tc, tc);
//      let l: f32 = dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)); let tc: vec3<f32> = value / (value + vec3<f32>(1.0, 1.0, 1.0)); return mix(value / (l + 1.0), tc, tc);
    }
    fn _tonemapUncharted2(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapUncharted2(value: vec3<f32>) -> vec3<f32>
    {
        const A: f32 = 0.15;
//      const A: f32 = 0.15;
        const B: f32 = 0.50;
//      const B: f32 = 0.50;
        const C: f32 = 0.10;
//      const C: f32 = 0.10;
        const D: f32 = 0.20;
//      const D: f32 = 0.20;
        const E: f32 = 0.02;
//      const E: f32 = 0.02;
        const F: f32 = 0.30;
//      const F: f32 = 0.30;
        const VCB: vec3<f32> = vec3<f32>(C * B, C * B, C * B);
//      const VCB: vec3<f32> = vec3<f32>(C * B, C * B, C * B);
        const VB : vec3<f32> = vec3<f32>(    B,     B,     B);
//      const VB : vec3<f32> = vec3<f32>(    B,     B,     B);
        const VDE: vec3<f32> = vec3<f32>(D * E, D * E, D * E);
//      const VDE: vec3<f32> = vec3<f32>(D * E, D * E, D * E);
        const VDF: vec3<f32> = vec3<f32>(D * F, D * F, D * F);
//      const VDF: vec3<f32> = vec3<f32>(D * F, D * F, D * F);
        const VEF: vec3<f32> = vec3<f32>(E / F, E / F, E / F);
//      const VEF: vec3<f32> = vec3<f32>(E / F, E / F, E / F);
        return ((value * (A * value + VCB) + VDE) / (value * (A * value + VB) + VDF)) - VEF;
//      return ((value * (A * value + VCB) + VDE) / (value * (A * value + VB) + VDF)) - VEF;
    }
    fn _tonemapUncharted1(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapUncharted1(value: vec3<f32>) -> vec3<f32>
    {
        const W: f32 = 11.2;
//      const W: f32 = 11.2;
        const exposureBias: f32 = 2.0;
//      const exposureBias: f32 = 2.0;
        let curr: vec3<f32> = _tonemapUncharted2(exposureBias * value);
//      let curr: vec3<f32> = _tonemapUncharted2(exposureBias * value);
        let whiteScale: vec3<f32> = 1.0 / _tonemapUncharted2(vec3<f32>(W, W, W));
//      let whiteScale: vec3<f32> = 1.0 / _tonemapUncharted2(vec3<f32>(W, W, W));
        return curr * whiteScale;
//      return curr * whiteScale;
    }
    fn _tonemapUnreal(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapUnreal(value: vec3<f32>) -> vec3<f32>
    {
        return value / (value + vec3<f32>(0.155, 0.155, 0.155)) * 1.019;
//      return value / (value + vec3<f32>(0.155, 0.155, 0.155)) * 1.019;
    }
    fn _tonemapLinear(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapLinear(value: vec3<f32>) -> vec3<f32>
    {
        return value;
//      return value;
    }
    fn _tonemapDrago(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapDrago(value: vec3<f32>) -> vec3<f32>
    {
        let lum: f32 = dot(value, vec3<f32>(0.2126, 0.7152, 0.0722));
//      let lum: f32 = dot(value, vec3<f32>(0.2126, 0.7152, 0.0722));
        let logLum: f32 = log2(1.0 + lum);
//      let logLum: f32 = log2(1.0 + lum);
        let bias: f32 = log2(0.85);
//      let bias: f32 = log2(0.85);
        let exponent: f32 = logLum / bias;
//      let exponent: f32 = logLum / bias;
        let scale: f32 = pow(0.96, exponent);
//      let scale: f32 = pow(0.96, exponent);
        return value * scale;
//      return value * scale;
    }
    fn _tonemapExponential(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapExponential(value: vec3<f32>) -> vec3<f32>
    {
        const exposure: f32 = 1.0;
//      const exposure: f32 = 1.0;
        return 1.0 - exp(-value * exposure);
//      return 1.0 - exp(-value * exposure);
    }
    fn _tonemapLogarithmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapLogarithmic(value: vec3<f32>) -> vec3<f32>
    {
        return value / (value + 1.0);
//      return value / (value + 1.0);
    }
    fn _tonemapExtendedReinhard(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapExtendedReinhard(value: vec3<f32>) -> vec3<f32>
    {
        const whitePoint: f32 = 4.0; // This can be adjusted, or calculated from the scene's max brightness.
//      const whitePoint: f32 = 4.0; // This can be adjusted, or calculated from the scene's max brightness.
        let numerator: vec3<f32> = value * (1.0 + (value / (whitePoint * whitePoint)));
//      let numerator: vec3<f32> = value * (1.0 + (value / (whitePoint * whitePoint)));
        return numerator / (1.0 + value);
//      return numerator / (1.0 + value);
    }
    fn _tonemapHableFilmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapHableFilmic(value: vec3<f32>) -> vec3<f32>
    {
        const A: f32 = 0.22; // Shoulder Strength
//      const A: f32 = 0.22; // Shoulder Strength
        const B: f32 = 0.30; // Linear   Strength
//      const B: f32 = 0.30; // Linear   Strength
        const C: f32 = 0.10; // Linear   Angle
//      const C: f32 = 0.10; // Linear   Angle
        const D: f32 = 0.20; // Toe      Strength
//      const D: f32 = 0.20; // Toe      Strength
        const E: f32 = 0.01; // Toe        Numerator
//      const E: f32 = 0.01; // Toe        Numerator
        const F: f32 = 0.30; // Toe      Denominator
//      const F: f32 = 0.30; // Toe      Denominator
        const exposure: f32 = 2.0;
//      const exposure: f32 = 2.0;

        let curr: vec3<f32> = ((value * (A * value + C * B) + D * E) / (value * (A * value + B) + D * F)) - E / F;
//      let curr: vec3<f32> = ((value * (A * value + C * B) + D * E) / (value * (A * value + B) + D * F)) - E / F;
        const whitePoint: vec3<f32> = ((vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + C * B) + D * E) / (vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + B) + D * F)) - E / F;
//      const whitePoint: vec3<f32> = ((vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + C * B) + D * E) / (vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + B) + D * F)) - E / F;

        return curr * (1.0 / whitePoint);
//      return curr * (1.0 / whitePoint);
    }
    fn _tonemapACESFitted(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapACESFitted(value: vec3<f32>) -> vec3<f32>
    {
        // Narkowicz 2015, "ACES Filmic Tone Mapping Curve"
        // Narkowicz 2015, "ACES Filmic Tone Mapping Curve"
        const a: f32 = 2.51;
//      const a: f32 = 2.51;
        const b: f32 = 0.03;
//      const b: f32 = 0.03;
        const c: f32 = 2.43;
//      const c: f32 = 2.43;
        const d: f32 = 0.59;
//      const d: f32 = 0.59;
        const e: f32 = 0.14;
//      const e: f32 = 0.14;

        let clamped: vec3<f32> = saturate((value * (a * value + b)) / (value * (c * value + d) + e));
//      let clamped: vec3<f32> = saturate((value * (a * value + b)) / (value * (c * value + d) + e));
        return clamped;
//      return clamped;
    }
    fn _tonemapLottes(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapLottes(value: vec3<f32>) -> vec3<f32>
    {
        // A simpler, more robust curve inspired by Lottes' GDC talks
        // A simpler, more robust curve inspired by Lottes' GDC talks
        const contrast: f32 = 1.60;
//      const contrast: f32 = 1.60;
        const shoulder: f32 = 0.98;
//      const shoulder: f32 = 0.98;

        // Apply contrast
        // Apply contrast
        let contrasted: vec3<f32> = vec3<f32>
//      let contrasted: vec3<f32> = vec3<f32>
        (
            pow(value.x, contrast),
            pow(value.y, contrast),
            pow(value.z, contrast),
        );

        // Apply shoulder curve to compress highlights
        // Apply shoulder curve to compress highlights
        let tonemapped: vec3<f32> = vec3<f32>
//      let tonemapped: vec3<f32> = vec3<f32>
        (
            (1.0 - shoulder) * contrasted.x + shoulder * contrasted.x / (1.0 + contrasted.x),
            (1.0 - shoulder) * contrasted.y + shoulder * contrasted.y / (1.0 + contrasted.y),
            (1.0 - shoulder) * contrasted.z + shoulder * contrasted.z / (1.0 + contrasted.z),
        );

        return tonemapped;
//      return tonemapped;
    }
    fn _tonemapHejlFilmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapHejlFilmic(value: vec3<f32>) -> vec3<f32>
    {
        let temp: vec3<f32> = vec3<f32>
//      let temp: vec3<f32> = vec3<f32>
        (
            max(0.0, value.x - 0.004),
            max(0.0, value.y - 0.004),
            max(0.0, value.z - 0.004),
        );

        let   numerator: vec3<f32> = (temp * (6.2 * temp + 0.5));
//      let   numerator: vec3<f32> = (temp * (6.2 * temp + 0.5));
        let denominator: vec3<f32> = (temp * (6.2 * temp + 1.7)) + 0.06;
//      let denominator: vec3<f32> = (temp * (6.2 * temp + 1.7)) + 0.06;

        return vec3<f32>
//      return vec3<f32>
        (
            numerator.x / denominator.x,
            numerator.y / denominator.y,
            numerator.z / denominator.z,
        );
    }
    fn _tonemapNeutral(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapNeutral(value: vec3<f32>) -> vec3<f32>
    {
        const A: f32 = 0.15;
//      const A: f32 = 0.15;
        const B: f32 = 0.50;
//      const B: f32 = 0.50;
        const C: f32 = 0.10;
//      const C: f32 = 0.10;
        const D: f32 = 0.20;
//      const D: f32 = 0.20;
        const E: f32 = 0.02;
//      const E: f32 = 0.02;
        const F: f32 = 0.30;
//      const F: f32 = 0.30;
        const W: f32 = 11.2;
//      const W: f32 = 11.2;
        const exposure: f32 = 2.0;
//      const exposure: f32 = 2.0;

        let exposedColor: vec3<f32> = exposure * value;
//      let exposedColor: vec3<f32> = exposure * value;

        let VCB: vec3<f32> = vec3<f32>(C * B, C * B, C * B);
//      let VCB: vec3<f32> = vec3<f32>(C * B, C * B, C * B);
        let VB : vec3<f32> = vec3<f32>(    B,     B,     B);
//      let VB : vec3<f32> = vec3<f32>(    B,     B,     B);
        let VDE: vec3<f32> = vec3<f32>(D * E, D * E, D * E);
//      let VDE: vec3<f32> = vec3<f32>(D * E, D * E, D * E);
        let VDF: vec3<f32> = vec3<f32>(D * F, D * F, D * F);
//      let VDF: vec3<f32> = vec3<f32>(D * F, D * F, D * F);
        let VEF: vec3<f32> = vec3<f32>(E / F, E / F, E / F);
//      let VEF: vec3<f32> = vec3<f32>(E / F, E / F, E / F);

        let curr: vec3<f32> = ((exposedColor * (A * exposedColor + VCB) + VDE) / (exposedColor * (A * exposedColor + VB) + VDF)) - VEF;
//      let curr: vec3<f32> = ((exposedColor * (A * exposedColor + VCB) + VDE) / (exposedColor * (A * exposedColor + VB) + VDF)) - VEF;

        let whitePointVec: vec3<f32> = vec3<f32>(W, W, W);
//      let whitePointVec: vec3<f32> = vec3<f32>(W, W, W);
        let whitePoint: vec3<f32> = ((whitePointVec * (A * whitePointVec + VCB) + VDE) / (whitePointVec * (A * whitePointVec + VB) + VDF)) - VEF;
//      let whitePoint: vec3<f32> = ((whitePointVec * (A * whitePointVec + VCB) + VDE) / (whitePointVec * (A * whitePointVec + VB) + VDF)) - VEF;

        return curr / whitePoint;
//      return curr / whitePoint;
    }
    fn _tonemapPerceptual(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapPerceptual(value: vec3<f32>) -> vec3<f32>
    {
        let luminance: f32 = dot(value, vec3<f32>(0.2126, 0.7152, 0.0722));
//      let luminance: f32 = dot(value, vec3<f32>(0.2126, 0.7152, 0.0722));
        let tonemappedLuminance: f32 = luminance / (1.0 + luminance);
//      let tonemappedLuminance: f32 = luminance / (1.0 + luminance);
        let scale: f32 = select(0.0, tonemappedLuminance / luminance, luminance > 0.0);
//      let scale: f32 = select(0.0, tonemappedLuminance / luminance, luminance > 0.0);
        return value * scale;
//      return value * scale;
    }

    //  Screen Space Volumetric Lighting as Post Processing, by Ridge/winlandiano
//  //  Screen Space Volumetric Lighting as Post Processing, by Ridge/winlandiano
    //  Originally presented in GPU Gem3 Chap. 13, by Kenny Mitchell.
//  //  Originally presented in GPU Gem3 Chap. 13, by Kenny Mitchell.
    //  License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
//  //  License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

    const SSVL_NUM_SAMPLES: u32 = 100;
//  const SSVL_NUM_SAMPLES: u32 = 100;
    const SSVL_DENSITY: f32 = 2.0;
//  const SSVL_DENSITY: f32 = 2.0;
    const SSVL_WEIGHT: f32 = 0.1;
//  const SSVL_WEIGHT: f32 = 0.1;
    const SSVL_DECAY: f32 = 0.92;
//  const SSVL_DECAY: f32 = 0.92;
    const SSVL_EXPOSURE: f32 = 0.4;
//  const SSVL_EXPOSURE: f32 = 0.4;

    fn _screenSpaceVolumetricLighting(tex: texture_2d<f32>, sam: sampler, fragmentShaderInputUV: vec2<f32>, lightPosition: vec2<f32>) -> vec3<f32>
//  fn _screenSpaceVolumetricLighting(tex: texture_2d<f32>, sam: sampler, fragmentShaderInputUV: vec2<f32>, lightPosition: vec2<f32>) -> vec3<f32>
    {
        var uv: vec2<f32> = fragmentShaderInputUV;
//      var uv: vec2<f32> = fragmentShaderInputUV;
        var color: vec3<f32> = textureSample(tex, sam, uv).rgb;
//      var color: vec3<f32> = textureSample(tex, sam, uv).rgb;
        var sampleStep: vec2<f32> = uv - lightPosition;
//      var sampleStep: vec2<f32> = uv - lightPosition;
        sampleStep *= SSVL_DENSITY / f32(SSVL_NUM_SAMPLES);
//      sampleStep *= SSVL_DENSITY / f32(SSVL_NUM_SAMPLES);
        var illuminationDecay: f32 = 1.0;
//      var illuminationDecay: f32 = 1.0;
        for (var i: u32 = 0; i < SSVL_NUM_SAMPLES; i++)
//      for (var i: u32 = 0; i < SSVL_NUM_SAMPLES; i++)
        {
            uv -= sampleStep;
//          uv -= sampleStep;
            let sampleColor: vec3<f32> = textureSample(tex, sam, uv).rgb;
//          let sampleColor: vec3<f32> = textureSample(tex, sam, uv).rgb;
            var brightness: f32 = (sampleColor.r + sampleColor.g + sampleColor.b) / 3.0;
//          var brightness: f32 = (sampleColor.r + sampleColor.g + sampleColor.b) / 3.0;
            brightness *= illuminationDecay * SSVL_WEIGHT;
//          brightness *= illuminationDecay * SSVL_WEIGHT;
            color += vec3<f32>(brightness);
//          color += vec3<f32>(brightness);
            illuminationDecay *= SSVL_DECAY;
//          illuminationDecay *= SSVL_DECAY;
        }
        return color * SSVL_EXPOSURE;
//      return color * SSVL_EXPOSURE;
    }

    fn _lensFlares(uv: vec2<f32>, lightPosition: vec2<f32>, useLightFlares: bool, useLensFlares: bool, lightColor: vec3<f32>, vibrantFactor: f32) -> vec3<f32>
//  fn _lensFlares(uv: vec2<f32>, lightPosition: vec2<f32>, useLightFlares: bool, useLensFlares: bool, lightColor: vec3<f32>, vibrantFactor: f32) -> vec3<f32>
    {
        let main: vec2<f32> = uv - lightPosition;
//      let main: vec2<f32> = uv - lightPosition;
        let uvd : vec2<f32> = uv * length(uv);
//      let uvd : vec2<f32> = uv * length(uv);

        let ang: f32 = atan2(main.y, main.x);
//      let ang: f32 = atan2(main.y, main.x);

        var dist: f32 = length(main);
//      var dist: f32 = length(main);
        dist = pow(dist, 0.1);
//      dist = pow(dist, 0.1);

        var f0: f32 = 1.0 / (length(uv - lightPosition) * 25.0 + 1.0);
//      var f0: f32 = 1.0 / (length(uv - lightPosition) * 25.0 + 1.0);
        f0 = pow(f0, 2.0);
//      f0 = pow(f0, 2.0);
        f0 = f0 + f0 * (sin((ang + 1.0 / 18.0) * 12.0) * 0.1 + dist * 0.1 + 0.8);
//      f0 = f0 + f0 * (sin((ang + 1.0 / 18.0) * 12.0) * 0.1 + dist * 0.1 + 0.8);

        let f2 : f32 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.80 * lightPosition), 2.0)), 0.0) * 0.25;
//      let f2 : f32 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.80 * lightPosition), 2.0)), 0.0) * 0.25;
        let f22: f32 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.85 * lightPosition), 2.0)), 0.0) * 0.23;
//      let f22: f32 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.85 * lightPosition), 2.0)), 0.0) * 0.23;
        let f23: f32 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.90 * lightPosition), 2.0)), 0.0) * 0.21;
//      let f23: f32 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.90 * lightPosition), 2.0)), 0.0) * 0.21;

        var uvx: vec2<f32> = mix(uv, uvd, -0.5);
//      var uvx: vec2<f32> = mix(uv, uvd, -0.5);

        let f4 : f32 = max(0.01 - pow(length(uvx + 0.40 * lightPosition), 2.4), 0.0) * 6.0;
//      let f4 : f32 = max(0.01 - pow(length(uvx + 0.40 * lightPosition), 2.4), 0.0) * 6.0;
        let f42: f32 = max(0.01 - pow(length(uvx + 0.45 * lightPosition), 2.4), 0.0) * 5.0;
//      let f42: f32 = max(0.01 - pow(length(uvx + 0.45 * lightPosition), 2.4), 0.0) * 5.0;
        let f43: f32 = max(0.01 - pow(length(uvx + 0.50 * lightPosition), 2.4), 0.0) * 3.0;
//      let f43: f32 = max(0.01 - pow(length(uvx + 0.50 * lightPosition), 2.4), 0.0) * 3.0;

        uvx = mix(uv, uvd, -0.4);
//      uvx = mix(uv, uvd, -0.4);

        let f5 : f32 = max(0.01 - pow(length(uvx + 0.2 * lightPosition), 5.5), 0.0) * 2.0;
//      let f5 : f32 = max(0.01 - pow(length(uvx + 0.2 * lightPosition), 5.5), 0.0) * 2.0;
        let f52: f32 = max(0.01 - pow(length(uvx + 0.4 * lightPosition), 5.5), 0.0) * 2.0;
//      let f52: f32 = max(0.01 - pow(length(uvx + 0.4 * lightPosition), 5.5), 0.0) * 2.0;
        let f53: f32 = max(0.01 - pow(length(uvx + 0.6 * lightPosition), 5.5), 0.0) * 2.0;
//      let f53: f32 = max(0.01 - pow(length(uvx + 0.6 * lightPosition), 5.5), 0.0) * 2.0;

        uvx = mix(uv, uvd, -0.5);
//      uvx = mix(uv, uvd, -0.5);

        let f6 : f32 = max(0.01 - pow(length(uvx - 0.300 * lightPosition), 1.6), 0.0) * 6.0;
//      let f6 : f32 = max(0.01 - pow(length(uvx - 0.300 * lightPosition), 1.6), 0.0) * 6.0;
        let f62: f32 = max(0.01 - pow(length(uvx - 0.325 * lightPosition), 1.6), 0.0) * 3.0;
//      let f62: f32 = max(0.01 - pow(length(uvx - 0.325 * lightPosition), 1.6), 0.0) * 3.0;
        let f63: f32 = max(0.01 - pow(length(uvx - 0.350 * lightPosition), 1.6), 0.0) * 5.0;
//      let f63: f32 = max(0.01 - pow(length(uvx - 0.350 * lightPosition), 1.6), 0.0) * 5.0;

        let lightFlares: vec3<f32> = select(vec3<f32>(0.0), vec3<f32>(f0), useLightFlares);
//      let lightFlares: vec3<f32> = select(vec3<f32>(0.0), vec3<f32>(f0), useLightFlares);
        let  lensFlares: vec3<f32> = select(vec3<f32>(0.0), vec3<f32>(f2 + f4 + f5 + f6, f22 + f42 + f52 + f62, f23 + f43 + f53 + f63), useLensFlares);
//      let  lensFlares: vec3<f32> = select(vec3<f32>(0.0), vec3<f32>(f2 + f4 + f5 + f6, f22 + f42 + f52 + f62, f23 + f43 + f53 + f63), useLensFlares);

        let color: vec3<f32> = (lightFlares + lensFlares) * lightColor * vibrantFactor;
//      let color: vec3<f32> = (lightFlares + lensFlares) * lightColor * vibrantFactor;
        return pow(color, vec3<f32>(1.0 / 2.2));
//      return pow(color, vec3<f32>(1.0 / 2.2));
    }
