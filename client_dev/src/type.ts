export interface GameObjects {
    units: Record<string, any>;
    dynamics: Record<string, any>;
    statics: Record<string, any>;
};

export type SnakeSegment = {
    x: number;
    y: number;
    size: number;
};

export type UnitTuple = (number | string)[]

export interface DecodedUnit {
  type: number
  x: number
  y: number
  z: number
  r: number
  width: number
  height: number
  angle: number
  radius: number
  hp: number
  maxHP: number
  targetX: number
  targetY: number
  colorIndex: number
  isLead: number
  boost: number
  segmentIndex: number // 0 for head, 1+ for body segments
  prevUnitId: number // -1 if none
  name: string // player name
  spacing: number // spacing between segments
}