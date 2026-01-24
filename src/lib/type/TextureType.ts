    export const TextureType = {
//  export const TextureType = {
        COLOR: 0,
//      COLOR: 0,
        IMAGE: 1,
//      IMAGE: 1,
        CHECKER_STYLE_A: 2,
//      CHECKER_STYLE_A: 2,
        CHECKER_STYLE_B: 3,
//      CHECKER_STYLE_B: 3,
    } as const;
//  } as const;
    export type TextureType = typeof TextureType[keyof typeof TextureType];
//  export type TextureType = typeof TextureType[keyof typeof TextureType];
