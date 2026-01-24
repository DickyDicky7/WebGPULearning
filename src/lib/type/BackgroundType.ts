    export const BackgroundType = {
//  export const BackgroundType = {
        SKY_BOX_BLUE: 0,
//      SKY_BOX_BLUE: 0,
        SKY_BOX_DARK: 1,
//      SKY_BOX_DARK: 1,
        SKY_BOX_HDRI: 2,
//      SKY_BOX_HDRI: 2,
    } as const;
//  } as const;
    export type BackgroundType = typeof BackgroundType[keyof typeof BackgroundType];
//  export type BackgroundType = typeof BackgroundType[keyof typeof BackgroundType];
