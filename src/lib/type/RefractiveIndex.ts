    export const RefractiveIndex = {
//  export const RefractiveIndex = {
        DEFAULT: 0.000000,
//      DEFAULT: 0.000000,
        NOTHING: 1.000000,
//      NOTHING: 1.000000,
        AIR    : 1.000293,
//      AIR    : 1.000293,
        WATER  : 1.333000,
//      WATER  : 1.333000,
        SKIN   : 1.400000,
//      SKIN   : 1.400000,
        GLASS  : 1.500000,
//      GLASS  : 1.500000,
        MARBLE : 1.550000,
//      MARBLE : 1.550000,
        DIAMOND: 2.400000,
//      DIAMOND: 2.400000,
    } as const;
//  } as const;
    export type RefractiveIndex = typeof RefractiveIndex[keyof typeof RefractiveIndex];
//  export type RefractiveIndex = typeof RefractiveIndex[keyof typeof RefractiveIndex];
