import { describe, it } from "node:test";

import assert from "node:assert";
import { getDataFromCardAnimations } from "./fileFactory.ts";

describe("getDataFromCardAnimations", () => {
    it("should return nothing when no card animations exist", () => {
        const actual = getDataFromCardAnimations({}, {});
        assert.deepEqual(actual, {});
    });
    it("should return one frame animation", () => {
        const actual = getDataFromCardAnimations(
            {
                my_sample_card: {
                    sprites: ["my_sample_png.png"],
                    points: {
                        origin: { x: 0, y: 0 },
                        center: { x: 0, y: 0 },
                    },
                },
            },
            {
                my_sample_card: {
                    por_obj: "obj_unit_eh",
                },
            },
        );

        assert(
            actual.resources?.resources.find(
                (resource) => resource.name == "my_sample_png.png",
            ),
            "sprite in resources",
        );

        assert(
            (actual.layouts ?? [])[0].objects.find(
                (my_obj) => my_obj.name == "obj_unit_eh",
            ),
            "card portiat in objects",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                ),
            "card in animations",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
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
    it("should return three frame animation", () => {
        const actual = getDataFromCardAnimations(
            {
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
            },
            {
                my_sample_card: {
                    por_obj: "obj_unit_eh",
                },
            },
        );

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
                (my_obj) => my_obj.name == "obj_unit_eh",
            ),
            "card portiat in objects",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                ),
            "card in animations",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
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
                .find((my_obj) => my_obj.name == "obj_unit_eh")
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
                .find((my_obj) => my_obj.name == "obj_unit_eh")
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
                .find((my_obj) => my_obj.name == "obj_unit_eh")
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
