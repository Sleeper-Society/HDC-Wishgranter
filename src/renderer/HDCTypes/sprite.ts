import type { AnimationFrame } from "./gdjs.ts";
import type { Card } from "./card.ts";
import type { Faction } from "./faction.ts";
interface Point {
  x: number;
  y: number;
}

export class Sprite {
  file_path: string;
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
    this.file_path = file_name;
    this.width = width;
    this.height = height;
    this.origin_point = { x: width / 2, y: width / 2 };
  }
  getResource(faction: Faction, card: Card, sprite_index: number) {
    return {
      file: this.file_path,
      kind: "image",
      metadata: "",
      name: Sprite.getId(faction, card, sprite_index),
      smoothed: false,
      userAdded: true,
    };
  }
  static getId(faction: Faction, card: Card, sprite_index: number) {
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
    card: Card,
    sprite_index: number,
  ): AnimationFrame {
    return {
      hasCustomCollisionMask: true,
      image: Sprite.getId(faction, card, sprite_index),
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
