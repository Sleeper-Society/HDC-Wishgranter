import type { LoadSequenceElement } from "./mod_menu/loadingBar.ts";
import { getCode0FromMods } from "./fileFactory.ts";

export function unloadWishgranter() {
    document.body.classList.remove("game_loadable");
    for (const element of document.head.getElementsByClassName(
        "wishgranter_script",
    )) {
        element.remove();
    }
}

export async function loadWishgranter(
    hyperspace_path: string,
): Promise<Iterable<LoadSequenceElement<[string]>>> {
    return await window.wishgranter
        .getHyperspaceScriptTags(hyperspace_path)
        .then((script_sources) =>
            script_sources
                .filter((script_source) => !exclusions.includes(script_source))
                .map(getAddPossiblyReplacedScriptLoadSequenceElement),
        );
}

const exclusions = ["data.js"];

type ReplacementMap = Record<
    `${string}.js`,
    | string
    | Promise<string>
    | ((
          hyperspace_path: string,
      ) => AsyncIterable<string> | Iterable<string> | Promise<string> | string)
>;
const replacements: ReplacementMap = {
    "pixi-renderers/loadingscreen-pixi-renderer.js":
        "dist/reimplementations/loadingReimplementation.js",
    "Extensions/FileSystem/filesystemtools.js":
        "dist/reimplementations/filesystemReimplementation.js",
    "jsonmanager.js": "dist/reimplementations/jsonManagerReimplementation.js",

    "pixi-renderers/runtimegame-pixi-renderer.js": replaceElectronRemote,
    "code0.js": replaceCode0,
};
const dev_replacements: ReplacementMap = {};

async function* replaceCode0(): AsyncIterable<string> {
    const code0 = getCode0FromMods();
    if (window.remote_replace.app.isPackaged()) {
        yield window.wishgranter.createTemporaryFile("code0.js", code0);
        return;
    }

    const regex =
        /gdjs.CommandCode.eventsList\d+ ?= ?function ?\(runtimeScene(, ?asyncObjectsList)?\) ?\{[^]*?\};/g;
    yield window.wishgranter.createTemporaryFile(
        "code0remainder.js",
        code0.replaceAll(regex, ""),
    );
    yield* code0
        .match(regex)
        ?.map((match, index) =>
            window.wishgranter.createTemporaryFile(
                `code0event${index.toString()}.js`,
                match,
            ),
        ) ?? [];
}

function replaceElectronRemote(hyperspace_path: string): Promise<string> {
    return window.wishgranter
        .readHyperspaceFile(
            hyperspace_path,
            "pixi-renderers/runtimegame-pixi-renderer.js",
        )
        .then((renderer_code) =>
            renderer_code.replace(
                /(?<=this.getElectronRemote ?= ?\(\) ?=> ?\{)[^]*?(?=\};)/,
                `return window.remote_replace`,
            ),
        )
        .then((renderer_code) =>
            window.wishgranter.createTemporaryFile(
                "renderer.js",
                renderer_code,
            ),
        );
}

function getAddPossiblyReplacedScriptLoadSequenceElement(
    script_source: `${string}.js`,
): LoadSequenceElement<[string]> {
    const sep: string = window.remote_replace.path.sep();
    const replacement_map: ReplacementMap =
        window.remote_replace.app.isPackaged() ?
            replacements
        :   { ...replacements, ...dev_replacements };
    const script_name =
        script_source.split(sep)[script_source.split(sep).length - 1];
    if (!(script_source in replacement_map)) {
        return {
            status_text: `Loading ${script_name}`,
            function: (hyperspace_path) =>
                addScript(
                    `${hyperspace_path}${sep}resources${sep}app.asar${sep}app${sep}${script_source}`,
                    false,
                ),
        };
    } else if (typeof replacement_map[script_source] == "string") {
        return {
            status_text: `Loading ${script_name}`,
            function: () => addScript(replacement_map[script_source] as string),
        };
    } else if (typeof replacement_map[script_source] != "function") {
        return {
            status_text: `Loading ${script_name}`,
            function: async () =>
                addScript(
                    await (replacement_map[script_source] as Promise<string>),
                ),
        };
    } else {
        return {
            status_text: `Replacing ${script_name}`,
            estimated_loading_time_multiplier: 100,
            function: async (hyperspace_path) => {
                const script_source_result = await (
                    replacement_map[script_source] as (
                        hyperspace_path: string,
                    ) =>
                        | AsyncIterable<string>
                        | Iterable<string>
                        | Promise<string>
                        | string
                )(hyperspace_path);
                if (typeof script_source_result == "string")
                    return addScript(script_source_result, false);
                else {
                    const out = [];
                    for await (const sub_script_source of script_source_result) {
                        out.push(() => addScript(sub_script_source, false));
                    }
                    return out.map((func, index) => {
                        return {
                            status_text: `Loading ${script_name} ${index.toString()}/${out.length.toString()}`,
                            function: func,
                        };
                    });
                }
            },
        };
    }
}

function addScript(script_source: string, module = true) {
    return new Promise<void>((resolve) => {
        const script_orphan = document.createElement("script");
        script_orphan.src = script_source;
        if (module) script_orphan.type = "module";
        script_orphan.crossOrigin = "anonymous";
        script_orphan.className = "wishgranter_script";
        script_orphan.addEventListener("load", () => {
            resolve();
        });
        document.head.appendChild(script_orphan);
    });
}
