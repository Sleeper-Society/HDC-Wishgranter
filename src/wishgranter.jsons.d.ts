export type WishgranterJsons = CardAnimations | Data;

/**
 * Helper json to define card animations which eventually gets conveted and merged into Data
 */
export type CardAnimations = Record<
    string,
    {
        /**
         * Local paths to sprites (png, svg, jpeg)
         */
        sprites: string[];
        /**
         * Pixel coordanates for guns, bomber/fighter spawning, and alignment.
         * If more than one point record is given, any frames without definition will be linearly interpolated.
         * If an array, defined points will be spread evenly across frames
         */
        points: CardAnimationPoints;
        /**
         * Points of a polygon where the mouse will consider this sprite selected
         **/
        collison_polygon: { x: number; y: number }[];
        /**
         * If defined, instead of shuffling the sprites in sprites to create the sparkel, the sprites will appear in the order spesified. Repeats encouraged.
         */
        frame_order?: number[];
    }
>;
type CardAnimationPoints = Record<string, { x: number; y: number }> & {
    origin: { x: number; y: number };
    center: { x: number; y: number };
}; /**
 * Native representation of GDevelop objects and scenes
 *
 * @remarks
 * Defined by data.js
 */
export interface Data {
    properties: {
        name: string;
        version: string;
        description: string;
        platformSpecificAssets: Record<string, string>;
    };
    resources: {
        /**
         * Array of all files accesable by the renderer or sound manager. Likely a expanded version of `usedResources`
         */
        resources: Resource[];
    };
    usedResources: { name: string }[];
    layouts: {
        name: "Command";
        objects: {
            variables: UnloadedVariable[];
            name: string;
            animations: Animation[];
        }[];
        variables: UnloadedVariable[];
        usedResources: { name: string }[];
    }[];
}
export type UnloadedVariable =
    | { folded?: true; name: string; type: "number"; value: number }
    | { folded?: true; name: string; type: "string"; value: string }
    | {
          folded?: true;
          name: string;
          type: "array";
          children: (
              | { type: "number"; value: number }
              | { type: "string"; value: string }
          )[];
      }
    | {
          folded?: true;
          name: string;
          type: "structure";
          children: UnloadedVariable[];
      };
export interface Animation {
    /**
     * When used for card animations, the card id is used
     */
    name: string;
    useMultipleDirections: false;
    directions: {
        looping: true;
        /**
         * In seconds
         */
        timeBetweenFrames: number;
        sprites: AnimationFrame[];
    }[];
}
export interface AnimationFrame {
    /**
     * Id of a sprite defined in Resources
     */
    image: string;
    points: {
        name: string;
        x: number;
        y: number;
    }[];
    originPoint: {
        name: "origine";
        x: number;
        y: number;
    };
    centerPoint: {
        automatic: boolean;
        name: "centre";
        x: number;
        y: number;
    };
    hasCustomCollisionMask: true;
    customCollisionMask: { x: number; y: number }[][];
}

export interface Resource {
    disablePreload?: boolean;
    file: string;
    kind: string;
    metadata?: string;
    name: string;
    smoothed: boolean;
    userAdded: boolean;
}
