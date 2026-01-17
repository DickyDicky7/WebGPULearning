    // --- High Quality Integer Hash (PCG) ---
//  // --- High Quality Integer Hash (PCG) ---
    // Much more stable than float hashes for game engines
//  // Much more stable than float hashes for game engines
    fn pcg_hash(input: u32) -> u32 {
//  fn pcg_hash(input: u32) -> u32 {
        let state = input * 747796405u + 2891336453u;
//      let state = input * 747796405u + 2891336453u;
        let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
//      let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
        return (word >> 22u) ^ word;
//      return (word >> 22u) ^ word;
    }
//  }

    // Convert 2D coord to normalized float [0, 1]
//  // Convert 2D coord to normalized float [0, 1]
    fn hash2D_to_float(p: vec2u) -> f32 {
//  fn hash2D_to_float(p: vec2u) -> f32 {
        // Combine x and y into a single seed
//      // Combine x and y into a single seed
        let seed = p.x * 1973u + p.y * 9277u;
//      let seed = p.x * 1973u + p.y * 9277u;
        // Hash it
//      // Hash it
        let h = pcg_hash(seed);
//      let h = pcg_hash(seed);
        // Convert u32 MAX to float 0..1
//      // Convert u32 MAX to float 0..1
        return f32(h) * (1.0 / 4294967296.0);
//      return f32(h) * (1.0 / 4294967296.0);
    }
//  }

    fn getTriangularNoise(p: vec2f) -> f32 {
//  fn getTriangularNoise(p: vec2f) -> f32 {
        let pixel_u = vec2u(p);
//      let pixel_u = vec2u(p);

        // Get two independent values
//      // Get two independent values
        let r1 = hash2D_to_float(pixel_u);
//      let r1 = hash2D_to_float(pixel_u);
        // We modify the seed slightly for the second number
//      // We modify the seed slightly for the second number
        let r2 = hash2D_to_float(pixel_u + vec2u(1234u, 5678u));
//      let r2 = hash2D_to_float(pixel_u + vec2u(1234u, 5678u));

        return r1 + r2 - 1.0;
//      return r1 + r2 - 1.0;
    }
//  }

    // Keep the same ditherColor function from above
//  // Keep the same ditherColor function from above
    fn ditherColor(col: vec3f, pixel_coords: vec2f, levels: f32) -> vec3f {
//  fn ditherColor(col: vec3f, pixel_coords: vec2f, levels: f32) -> vec3f {
        let noise = getTriangularNoise(pixel_coords);
//      let noise = getTriangularNoise(pixel_coords);
        let ditherShift = noise / levels;
//      let ditherShift = noise / levels;
        let ditheredCol = col + vec3f(ditherShift);
//      let ditheredCol = col + vec3f(ditherShift);
        return floor(ditheredCol * levels + 0.5) / levels;
//      return floor(ditheredCol * levels + 0.5) / levels;
    }
//  }
