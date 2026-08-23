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
                        origin: { x: 1, y: 2 },
                        center: { x: 3, y: 4 },
                        other_point: { x: 5, y: 6 },
                    },
                    collison_polygon: [{ x: 7, y: 8 }],
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
        assert.deepStrictEqual(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png.png",
                )?.originPoint,
            { x: 1, y: 2, name: "origine" },
            "Origin Set",
        );
        assert.deepStrictEqual(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png.png",
                )?.centerPoint,
            { x: 3, y: 4, name: "centre", automatic: true },
            "Center Set",
        );
        assert(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png.png",
                )
                ?.points.find(
                    (point) =>
                        point.name == "other_point" &&
                        point.x == 5 &&
                        point.y == 6,
                ),

            "Other point set",
        );
        assert.deepStrictEqual(
            (actual.layouts ?? [])[0].objects
                .find((my_obj) => my_obj.name == "obj_unit_eh")
                ?.animations.find(
                    (animation) => animation.name == "my_sample_card",
                )
                ?.directions[0].sprites.find(
                    (sprite) => sprite.image == "my_sample_png.png",
                )?.customCollisionMask,
            [{ x: 7, y: 8 }],
            "Collison Set",
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
                        origin: { x: 1, y: 2 },
                        center: { x: 3, y: 4 },
                        other_point: { x: 5, y: 6 },
                    },
                    collison_polygon: [{ x: 7, y: 8 }],
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
        for (const animation_frame of (actual.layouts ?? [])[0].objects
            .find((my_obj) => my_obj.name == "obj_unit_eh")
            ?.animations.find((animation) => animation.name == "my_sample_card")
            ?.directions[0].sprites ?? []) {
            assert.deepStrictEqual(
                animation_frame.originPoint,
                { x: 1, y: 2, name: "origine" },
                "Origin Set",
            );
            assert.deepStrictEqual(
                animation_frame.centerPoint,
                { x: 3, y: 4, name: "centre", automatic: true },
                "Center Set",
            );
            assert(
                animation_frame.points.find(
                    (point) =>
                        point.name == "other_point" &&
                        point.x == 5 &&
                        point.y == 6,
                ),

                "Other point set",
            );
            assert.deepStrictEqual(
                animation_frame.customCollisionMask,
                [{ x: 7, y: 8 }],
                "Collison Set",
            );
        }
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
    it("should respect frame order", () => {
        const frame_order = [1, 2, 2, 1];
        const actual = getDataFromCardAnimations(
            {
                my_sample_card: {
                    sprites: [
                        "my_sample_png0.png",
                        "my_sample_png1.png",
                        "my_sample_png2.png",
                    ],
                    points: {
                        origin: { x: 1, y: 2 },
                        center: { x: 3, y: 4 },
                        other_point: { x: 5, y: 6 },
                    },
                    collison_polygon: [{ x: 7, y: 8 }],
                    frame_order: frame_order,
                },
            },
            {
                my_sample_card: {
                    por_obj: "obj_unit_eh",
                },
            },
        );
        frame_order.forEach((sprite_index, frame_index) => {
            assert.equal(
                ((actual.layouts ?? [])[0].objects
                    .find((my_obj) => my_obj.name == "obj_unit_eh")
                    ?.animations.find(
                        (animation) => animation.name == "my_sample_card",
                    )?.directions[0].sprites ?? [])[frame_index].image,
                `my_sample_png${sprite_index.toString()}.png`,
                `Frame ${frame_index.toString()} has correct sprite`,
            );
        });
    });
});
