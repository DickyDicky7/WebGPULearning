    // --- 1. Random Number Generator (Float-based) ---
//  // --- 1. Random Number Generator (Float-based) ---
    // Based on the standard "Gold Noise" hash
//  // Based on the standard "Gold Noise" hash
    fn hash12(p: vec2f) -> f32 {
//  fn hash12(p: vec2f) -> f32 {
        var p3 = fract(vec3f(p.xyx) * 0.1031);
//      var p3 = fract(vec3f(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
//      p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
//      return fract((p3.x + p3.y) * p3.z);
    }
//  }

    // --- 2. Triangular Noise Generator ---
//  // --- 2. Triangular Noise Generator ---
    // Returns value in range [-1.0, 1.0] with a triangular distribution
//  // Returns value in range [-1.0, 1.0] with a triangular distribution
    fn getTriangularNoise(pixel_coords: vec2f) -> f32 {
//  fn getTriangularNoise(pixel_coords: vec2f) -> f32 {
        // We need two independent seeds.
//      // We need two independent seeds.
        // We offset the second one slightly to ensure independence.
//      // We offset the second one slightly to ensure independence.
        let r1 = hash12(pixel_coords);
//      let r1 = hash12(pixel_coords);
        let r2 = hash12(pixel_coords + vec2f(1.0, 1.0));
//      let r2 = hash12(pixel_coords + vec2f(1.0, 1.0));

        // Sum of two rectangular distributions (0..1) minus 1.0
//      // Sum of two rectangular distributions (0..1) minus 1.0
        return r1 + r2 - 1.0;
//      return r1 + r2 - 1.0;
    }
//  }

    // --- 3. Dither Application Utility ---
//  // --- 3. Dither Application Utility ---
    // Applies dithering and quantizes the color
//  // Applies dithering and quantizes the color
    // col: The original high-precision color
//  // col: The original high-precision color
    // pixel_coords: The screen position (e.g., input.position.xy)
//  // pixel_coords: The screen position (e.g., input.position.xy)
    // levels: Quantization levels (e.g., 255.0 for 8-bit)
//  // levels: Quantization levels (e.g., 255.0 for 8-bit)
    fn ditherColor(col: vec3f, pixel_coords: vec2f, levels: f32) -> vec3f {
//  fn ditherColor(col: vec3f, pixel_coords: vec2f, levels: f32) -> vec3f {
        let noise = getTriangularNoise(pixel_coords);
//      let noise = getTriangularNoise(pixel_coords);

        // Scale noise to 1 LSB (Least Significant Bit) width
//      // Scale noise to 1 LSB (Least Significant Bit) width
        // TPDF noise range is [-1, 1], so dividing by levels fits it exactly
//      // TPDF noise range is [-1, 1], so dividing by levels fits it exactly
        // into the gap between two integer steps.
//      // into the gap between two integer steps.
        let ditherShift = noise / levels;
//      let ditherShift = noise / levels;

        // Add noise to signal
//      // Add noise to signal
        let ditheredCol = col + vec3f(ditherShift);
//      let ditheredCol = col + vec3f(ditherShift);

        // Quantize
//      // Quantize
        return floor(ditheredCol * levels + 0.5) / levels;
//      return floor(ditheredCol * levels + 0.5) / levels;
    }
//  }
