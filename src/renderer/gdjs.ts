declare global {
  var gdjs: gdjs;
}

export interface gdjs {
  Logger: new (name: string) => { error: (...msg: unknown[]) => void };
  fileSystem?: unknown;
  projectData: projectData;
  CommandCode: Record<
    string,
    unknown[] | ((runtime_game: RuntimeGame) => void)
  >;
  RuntimeGame: RuntimeGameClass;
  copyArray: (from: unknown[], to: unknown[]) => void;
  evtsExt__GetPropertiesData__ReturnGameVersion: {
    func: (runtime: RuntimeGame, other: unknown) => string;
  };
}

interface projectData {
  properties: {
    name: string;
    version: string;
    description: string;
    platformSpecificAssets: Record<string, string>;
  };
  resources: {
    resources: { file: string }[];
  };
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
