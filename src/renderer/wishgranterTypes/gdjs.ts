declare global {
  var gdjs: gdjs;
}

export interface gdjs {
  Logger: new (name: string) => { error: (...msg: unknown[]) => void };
  fileSystem?: unknown;
  projectData: projectData;
  CommandCode: Record<
    string,
    | unknown[]
    | ((runtime_game: RuntimeGame) => void)
    | ((runtime_scene: RuntimeScene) => void)
    | null
  >;
  RuntimeGame: RuntimeGameClass;
  copyArray: (from: unknown[], to: unknown[]) => void;
  evtTools: {
    variable: {
      getVariableNumber: (variable: Variable) => number;
    };
    sound: {
      stopMusicOnChannel: (
        runtime_scene: RuntimeScene,
        channel: number,
      ) => void;
      playMusicOnChannel: (
        runtime_scene: RuntimeScene,
        music_name: string,
        channel: number,
        truth: true,
        zero: 0,
        one: 1,
      ) => void;
    };
  };
  evtsExt__GetPropertiesData__ReturnGameVersion: {
    func: (runtime: RuntimeGame, other: null) => string;
  };
  evtsExt__JSONResourceLoader__LoadJSONToScene: {
    func: (
      runtime: RuntimeScene,
      resource_name: string,
      variable: Variable,
      other: null,
    ) => void;
  };
}

export interface projectData {
  properties: {
    name: string;
    version: string;
    description: string;
    platformSpecificAssets: Record<string, string>;
  };
  resources: {
    resources: {
      file: string;
      kind: string;
      metadata: string;
      name: string;
      smoothed: boolean;
      userAdded: boolean;
    }[];
  };
  layouts: {
    objects: {
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
  name: string;
  useMultipleDirections: boolean;
  directions: {
    looping: boolean;
    timeBetweenFrames: number;
    sprites: AnimationFrame[];
  }[];
}

export interface AnimationFrame {
  hasCustomCollisionMask: boolean;
  image: string;
  points: {
    name: string;
    x: number;
    y: number;
  }[];
  originPoint: {
    name: string;
    x: number;
    y: number;
  };
  centerPoint: {
    automatic: boolean;
    name: string;
    x: number;
    y: number;
  };
  customCollisionMask: {
    x: number;
    y: number;
  }[][];
}

type RuntimeGameClass = new (
  projectData: projectData,
  something_else: unknown,
) => RuntimeGame;

export interface RuntimeGame {
  getRenderer: () => {
    createStandardCanvas: (on: HTMLElement) => void;
    bindStandardEvents: (a: unknown, b: unknown, c: unknown) => void;
  };
  getInputManager: () => unknown;
  loadAllAssets: (callback: () => void) => void;
  startGameLoop: () => void;
}

export interface RuntimeScene {
  getScene: () => RuntimeScene;
  getVariables: () => {
    getFromIndex: (index: number) => Variable;
  };
}

export interface Variable {
  fromJSObject: (object: object) => void;
}
