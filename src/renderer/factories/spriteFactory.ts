import type { Card, Faction } from "wishgranter";
import type { AnimationFrame, projectData } from "../wishgranterTypes/gdjs.ts";
import type { PathLike } from "fs";
import type { Card as TrueCard } from "./hdcTypeFactories/cardFactory.ts";

export class Sprite {
  file_path: string;
  constructor(file_path: PathLike) {
    this.file_path = file_path.toString();
  }
}

interface Point {
  x: number;
  y: number;
}

export class AnimatedSprite extends Sprite {
  width: number;
  height: number;
  origin_point: Point;
  points: Record<string, Point> = {};
  get mount_points(): Point[] {
    return Object.keys(this.points)
      .filter((key) => /^Mount\d+/.exec(key))
      .map((key) => this.points[key]);
  }
  set mount_points(mount_points: Point[]) {
    mount_points.forEach(
      (point, index) => (this.points["Mount" + index.toString()] = point),
    );
  }
  get aa_mount_points(): Point[] {
    return Object.keys(this.points)
      .filter((key) => /^AAMount\d+/.exec(key))
      .map((key) => this.points[key]);
  }
  set aa_mount_points(mount_points: Point[]) {
    mount_points.forEach(
      (point, index) => (this.points["AAMount" + index.toString()] = point),
    );
  }
  get comms_origin_point(): Point {
    return this.points.Comms;
  }
  set comms_origin_point(point: Point) {
    this.points.Comms = point;
  }
  get fighter_hanger_point(): Point {
    return this.points.HangarF;
  }
  set fighter_hanger_point(point: Point) {
    this.points.HangarF = point;
  }
  get bommer_hanger_point(): Point {
    return this.points.HangarB;
  }
  set bommer_hanger_point(point: Point) {
    this.points.HangarB = point;
  }

  constructor(file_name: string, width: number, height: number) {
    super(file_name);
    this.width = width;
    this.height = height;
    this.origin_point = { x: width / 2, y: width / 2 };
  }
  getResource(faction: Faction, card: TrueCard, sprite_index: number) {
    return {
      file: this.file_path,
      kind: "image",
      metadata: "",
      name: AnimatedSprite.getId(faction, card, sprite_index),
      smoothed: false,
      userAdded: true,
    };
  }
  static getId(faction: Faction, card: TrueCard, sprite_index: number) {
    return (
      "pixels/units/" +
      card.getId(faction) +
      "_" +
      sprite_index.toString() +
      "_0.png"
    );
  }
  getAnimationFrame(
    faction: Faction,
    card: TrueCard,
    sprite_index: number,
  ): AnimationFrame {
    return {
      hasCustomCollisionMask: true,
      image: AnimatedSprite.getId(faction, card, sprite_index),
      points: Object.keys(this.points).map((key) => {
        return { name: key, x: this.points[key].x, y: this.points[key].y };
      }),
      originPoint: { name: "origine", ...this.origin_point },
      centerPoint: { automatic: true, name: "center", ...this.origin_point },
      customCollisionMask: [
        [
          { x: 0, y: this.height },
          { x: 0, y: 0 },
          { x: this.width, y: 0 },
          { x: this.width, y: this.height },
        ],
      ],
    };
  }
}

export function getCardSprites(
  card_id: ReturnType<Card["getId"]>,
  hyperspace_deck_command_location: PathLike,
  resources: projectData["resources"]["resources"],
): AnimatedSprite[] {
  return resources
    .filter((resource) =>
      new RegExp(
        `${card_id.startsWith("ab") ? "ab" : "unit"}_${card_id}_\\d+\\.png`,
      ).test(resource.file),
    )
    .map((resource) => {
      const path = `${hyperspace_deck_command_location.toString()}${window.remote_replace.path.sep()}resources${window.remote_replace.path.sep()}app.asar${window.remote_replace.path.sep()}app${window.remote_replace.path.sep()}${resource.file}`;
      const image = new Image();
      image.src = path;

      return new AnimatedSprite(path, image.width, image.height);
    });
}
export function getBackgroundSprite(
  background_id: `cp_${string}`,
  hyperspace_deck_command_location: PathLike,
): Sprite {
  return new Sprite(
    `${hyperspace_deck_command_location.toString()}${window.remote_replace.path.sep()}resources${window.remote_replace.path.sep()}app.asar${window.remote_replace.path.sep()}app${window.remote_replace.path.sep()}${background_id.substring(2)}`,
  );
}
export function backgroundSpriteToId(sprite: Sprite): string {
  return `cp_${sprite.file_path}`;
}
