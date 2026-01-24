    export const MaterialType = {
//  export const MaterialType = {
        DIFFUSE   : 0,
//      DIFFUSE   : 0,
        METAL     : 1,
//      METAL     : 1,
        GLOSS     : 2,
//      GLOSS     : 2,
        DIELECTRIC: 3,
//      DIELECTRIC: 3,
        LIGHT     : 4,
//      LIGHT     : 4,
        PRINCIPLED: 5,
//      PRINCIPLED: 5,
    } as const;
//  } as const;
    export type MaterialType = typeof MaterialType[keyof typeof MaterialType];
//  export type MaterialType = typeof MaterialType[keyof typeof MaterialType];
