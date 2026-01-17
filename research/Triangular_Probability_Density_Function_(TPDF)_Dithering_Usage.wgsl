    struct VertexOutput {
//  struct VertexOutput {
        @builtin(position) position: vec4f,
//      @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
//      @location(0) uv: vec2f,
    };
//  };

    @fragment
//  @fragment
    fn fs_main(input: VertexOutput) -> @location(0) vec4f {
//  fn fs_main(input: VertexOutput) -> @location(0) vec4f {

        // 1. Get your Path Traced / Rendered color (Float32)
//      // 1. Get your Path Traced / Rendered color (Float32)
        var color = renderPathTracedScene(input.uv);
//      var color = renderPathTracedScene(input.uv);

        // 2. Apply Tone Mapping (e.g., ACES or Reinhard)
//      // 2. Apply Tone Mapping (e.g., ACES or Reinhard)
        color = toneMap(color);
//      color = toneMap(color);

        // 3. Apply Gamma Correction (Linear -> sRGB)
//      // 3. Apply Gamma Correction (Linear -> sRGB)
        color = pow(color, vec3f(1.0 / 2.2));
//      color = pow(color, vec3f(1.0 / 2.2));

        // 4. ---> APPLY TPDF DITHER HERE <---
//      // 4. ---> APPLY TPDF DITHER HERE <---
        // Use 255.0 for standard monitors
//      // Use 255.0 for standard monitors
        color = ditherColor(color, input.position.xy, 255.0);
//      color = ditherColor(color, input.position.xy, 255.0);

        return vec4f(color, 1.0);
//      return vec4f(color, 1.0);

    }
//  }
