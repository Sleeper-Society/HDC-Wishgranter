import { describe, it } from "node:test";
import { Mod } from "./mod.ts";
import assert from "node:assert";

describe("getDataFromCardAnimations", () => {
    it("should return nothing when no card animations exist", async () => {
        const mod = new Mod(
            true,
            "",
            () =>
                new Promise<string>((resolve) => {
                    resolve("");
                }),
        );
        await loadMockMod(mod);
        assert.deepEqual(mod.getDataFromCardAnimations(), {});
    });
    it("should return one frame animation", async () => {
        const mod = new Mod(
            true,
            "",
            (file_name) =>
                new Promise<string>((resolve) => {
                    switch (file_name) {
                        case "cards.json":
                            resolve(
                                JSON.stringify({
                                    my_sample_card: {
                                        por_obj: "por_obj_eh",
                                    },
                                }),
                            );
                            break;
                        case "card_animations.json":
                            resolve(
                                JSON.stringify({
                                    my_sample_card: {
                                        sprites: ["my_sample_png.png"],
                                        points: {
                                            origin: { x: 0, y: 0 },
                                            center: { x: 0, y: 0 },
                                        },
                                    },
                                }),
                            );
                            break;
                    }
                }),
        );
        await loadMockMod(mod);
        const actual = mod.getDataFromCardAnimations();

        assert(
            actual.resources?.resources.find(
                (resource) => resource.name == "my_sample_png.png",
            ),
            "sprite in resources",
        );

        assert(
            (actual.layouts ?? [])[0].objects.find(
                (my_obj) => my_obj.name == "por_obj_eh",
            ),
            "card portiat in objects",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                ),
            "card in animations",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png.png",
                ),
            "Sprite in animation",
        );
        assert(
            (actual.layouts ?? [])[0].usedResources.find(
                (resource) => resource.name == "my_sample_png.png",
            ),
            "Sprite in layout usedResources",
        );
        assert(
            actual.usedResources?.find(
                (used_resource) => used_resource.name == "my_sample_png.png",
            ),
            "Sprite in global usedResources",
        );
    });
    it("should return three frame animation", async () => {
        const mod = new Mod(
            true,
            "",
            (file_name) =>
                new Promise<string>((resolve) => {
                    switch (file_name) {
                        case "cards.json":
                            resolve(
                                JSON.stringify({
                                    my_sample_card: {
                                        por_obj: "por_obj_eh",
                                    },
                                }),
                            );
                            break;
                        case "card_animations.json":
                            resolve(
                                JSON.stringify({
                                    my_sample_card: {
                                        sprites: [
                                            "my_sample_png.png",
                                            "my_sample_png2.png",
                                            "my_sample_png3.png",
                                        ],
                                        points: {
                                            origin: { x: 0, y: 0 },
                                            center: { x: 0, y: 0 },
                                        },
                                    },
                                }),
                            );
                            break;
                    }
                }),
        );
        await loadMockMod(mod);
        const actual = mod.getDataFromCardAnimations();

        assert(
            actual.resources?.resources.find(
                (resource) => resource.name == "my_sample_png.png",
            ),
            "sprite in resources",
        );
        assert(
            actual.resources?.resources.find(
                (resource) => resource.name == "my_sample_png2.png",
            ),
            "second sprite in resources",
        );
        assert(
            actual.resources?.resources.find(
                (resource) => resource.name == "my_sample_png3.png",
            ),
            "third sprite in resources",
        );

        assert(
            (actual.layouts ?? [])[0].objects.find(
                (my_obj) => my_obj.name == "por_obj_eh",
            ),
            "card portiat in objects",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                ),
            "card in animations",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png.png",
                ),
            "Sprite in animation",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png2.png",
                ),
            "second Sprite in animation",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png3.png",
                ),
            "third Sprite in animation",
        );
        assert.equal(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "por_obj_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )?.directions[0].sprites.length,
            9,
            "sprites shuffled combinatorically",
        );
        assert(
            (actual.layouts ?? [])[0].usedResources.find(
                (resource) => resource.name == "my_sample_png.png",
            ),
            "Sprite in layout usedResources",
        );
        assert(
            (actual.layouts ?? [])[0].usedResources.find(
                (resource) => resource.name == "my_sample_png2.png",
            ),
            "second Sprite in layout usedResources",
        );
        assert(
            (actual.layouts ?? [])[0].usedResources.find(
                (resource) => resource.name == "my_sample_png3.png",
            ),
            "third Sprite in layout usedResources",
        );
        assert(
            actual.usedResources?.find(
                (used_resource) => used_resource.name == "my_sample_png.png",
            ),
            "Sprite in global usedResources",
        );
        assert(
            actual.usedResources?.find(
                (used_resource) => used_resource.name == "my_sample_png2.png",
            ),
            "second Sprite in global usedResources",
        );
        assert(
            actual.usedResources?.find(
                (used_resource) => used_resource.name == "my_sample_png3.png",
            ),
            "third Sprite in global usedResources",
        );
    });
});

async function loadMockMod(mod: Mod) {
    let loading_sequence = [
        ...(await mod.load("card_animations.json", "cards.json")),
    ];
    while (loading_sequence.length > 0) {
        const loading_result = (await loading_sequence.pop()?.function()) ?? [];
        loading_sequence = [...loading_result, ...loading_sequence];
    }
}
