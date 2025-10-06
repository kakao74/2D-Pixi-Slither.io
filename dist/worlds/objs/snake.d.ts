import { UnitObject } from "../../types";
import type SlitherWorld from "../slither-io";
declare class IOSnakeManager {
    private world;
    private slowSpeed;
    private fastSpeed;
    private rad;
    private colors;
    constructor(world: SlitherWorld);
    rgbToHex(r: number, g: number, b: number): string;
    describeSnakeFromScore(score: number): {
        radius: number;
        spacing: number;
        length: number;
        turnSpeed: number;
    };
    CreateSnake(isAI: number, x: number, y: number, size?: number, name?: string, initialTx?: number, initialTy?: number): number;
    AddEXP(head: UnitObject, exp: number): void;
    LoseEXP(head: UnitObject, exp: number): void;
    moveTo(head: UnitObject, dt: number): void;
    SimpleRotateTo(angle: number, target: number, spd: number): number;
    slither(head: UnitObject, dt: number): void;
    DoDeath(obj: UnitObject): void;
    CheckSnakeHeads(obj: UnitObject, dt: number): void;
    CheckHeadHit(d: UnitObject): (string | import("../../types").GameObject)[] | null;
}
export default IOSnakeManager;
//# sourceMappingURL=snake.d.ts.map