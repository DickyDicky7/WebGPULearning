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

    @group(0) @binding(0) var outputSampler: sampler;
//  @group(0) @binding(0) var outputSampler: sampler;
    @group(0) @binding(1) var outputTexture: texture_2d<f32>;
//  @group(0) @binding(1) var outputTexture: texture_2d<f32>;

    @vertex fn vertexShader(@builtin(vertex_index) vertexIndex : u32) -> VertexShaderOutput
//  @vertex fn vertexShader(@builtin(vertex_index) vertexIndex : u32) -> VertexShaderOutput
{
    var vertexShaderOutput: VertexShaderOutput;
//  var vertexShaderOutput: VertexShaderOutput;
    vertexShaderOutput.vertexPosition = vertexPosition[vertexIndex];
//  vertexShaderOutput.vertexPosition = vertexPosition[vertexIndex];
    vertexShaderOutput.uv = uv[vertexIndex];
//  vertexShaderOutput.uv = uv[vertexIndex];
    return vertexShaderOutput;
//  return vertexShaderOutput;
};

    @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
//  @fragment fn fragmentShader(fragmentShaderInput: FragmentShaderInput) -> @location(0) vec4<f32>
{
    let rgb: vec3<f32> = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv).rgb;
//  let rgb: vec3<f32> = textureSample(outputTexture, outputSampler, fragmentShaderInput.uv).rgb;
    return vec4<f32>(_vec3LinearToGamma(_tonemapACES(rgb)), 1.0);
//  return vec4<f32>(_vec3LinearToGamma(_tonemapACES(rgb)), 1.0);
};

    fn _vec4LinearToGamma(value: vec4<f32>) -> vec4<f32> { return sqrt(value); };
//  fn _vec4LinearToGamma(value: vec4<f32>) -> vec4<f32> { return sqrt(value); };
    fn _vec4GammaToLinear(value: vec4<f32>) -> vec4<f32> { return value * value; };
//  fn _vec4GammaToLinear(value: vec4<f32>) -> vec4<f32> { return value * value; };
    fn _vec3LinearToGamma(value: vec3<f32>) -> vec3<f32> { return sqrt(value); };
//  fn _vec3LinearToGamma(value: vec3<f32>) -> vec3<f32> { return sqrt(value); };
    fn _vec3GammaToLinear(value: vec3<f32>) -> vec3<f32> { return value * value; };
//  fn _vec3GammaToLinear(value: vec3<f32>) -> vec3<f32> { return value * value; };
    fn _vec2LinearToGamma(value: vec2<f32>) -> vec2<f32> { return sqrt(value); };
//  fn _vec2LinearToGamma(value: vec2<f32>) -> vec2<f32> { return sqrt(value); };
    fn _vec2GammaToLinear(value: vec2<f32>) -> vec2<f32> { return value * value; };
//  fn _vec2GammaToLinear(value: vec2<f32>) -> vec2<f32> { return value * value; };
    fn _f32LinearToGamma(value: f32) -> f32 { return sqrt(value); };
//  fn _f32LinearToGamma(value: f32) -> f32 { return sqrt(value); };
    fn _f32GammaToLinear(value: f32) -> f32 { return value * value; };
//  fn _f32GammaToLinear(value: f32) -> f32 { return value * value; };

    fn _f32Saturate(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }
//  fn _f32Saturate(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }
    fn _vec2Saturate(value: vec2<f32>) -> vec2<f32> { return clamp(value, vec2<f32>(0.0), vec2<f32>(1.0)); }
//  fn _vec2Saturate(value: vec2<f32>) -> vec2<f32> { return clamp(value, vec2<f32>(0.0), vec2<f32>(1.0)); }
    fn _vec3Saturate(value: vec3<f32>) -> vec3<f32> { return clamp(value, vec3<f32>(0.0), vec3<f32>(1.0)); }
//  fn _vec3Saturate(value: vec3<f32>) -> vec3<f32> { return clamp(value, vec3<f32>(0.0), vec3<f32>(1.0)); }
    fn _vec4Saturate(value: vec4<f32>) -> vec4<f32> { return clamp(value, vec4<f32>(0.0), vec4<f32>(1.0)); }
//  fn _vec4Saturate(value: vec4<f32>) -> vec4<f32> { return clamp(value, vec4<f32>(0.0), vec4<f32>(1.0)); }

    fn _tonemapACES(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapACES(value: vec3<f32>) -> vec3<f32>
    {
        return _vec3Saturate((value * (2.51 * value + vec3<f32>(0.03, 0.03, 0.03))) / (value * (2.43 * value + vec3<f32>(0.59, 0.59, 0.59)) + vec3<f32>(0.14, 0.14, 0.14)));
//      return _vec3Saturate((value * (2.51 * value + vec3<f32>(0.03, 0.03, 0.03))) / (value * (2.43 * value + vec3<f32>(0.59, 0.59, 0.59)) + vec3<f32>(0.14, 0.14, 0.14)));
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

        let clamped: vec3<f32> = _vec3Saturate((value * (a * value + b)) / (value * (c * value + d) + e));
//      let clamped: vec3<f32> = _vec3Saturate((value * (a * value + b)) / (value * (c * value + d) + e));
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
