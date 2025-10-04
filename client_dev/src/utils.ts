import { DecodedUnit, UnitTuple } from './type'

export function rgbToHex(red: number, green: number, blue: number) {
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export function randomNumber(n: number) {
    return Math.floor(Math.random() * n);
}

export function calculateLerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function adjustBrightnessRGB(red: number, green: number, blue: number, amount: number) {
    // Increase or decrease each component by 'amount'
    let newR = red + amount;
    let newG = green + amount;
    let newB = blue + amount;

    // Clamp values to 0-255 range
    newR = Math.min(255, Math.max(0, newR));
    newG = Math.min(255, Math.max(0, newG));
    newB = Math.min(255, Math.max(0, newB));

    return rgbToHex(newR, newG, newB);//{ r: newR, g: newG, b: newB };
}

export function drawDebugRect(objs: any[]) {
    for (const id in objs) {
        if (objs.hasOwnProperty(id)) {
            // const obj = objs[id];
            //OBJS.units[id].tx = obj[1];
            //OBJS.units[id].ty = obj[2];
            //OBJS.units[id].width = obj[4];
            //OBJS.units[id].height = obj[5];

            //PIXIGfx.lineStyle(1, 0xFF0000); // 2px red border
            //PIXIGfx.setStrokeStyle(1, 0xFF0000); // 2px red border
            // const x: number = obj[1] - (obj[5] / 2);//centered box
            // const y: number = obj[2] - (obj[6] / 2);
            //PIXIGfx.drawRect(x,y, obj[5], obj[6]);
            //            PIXIGfx.Circle(obj[1], obj[2], obj[7]).stroke(0xFF0000).setStrokeStyle(1)
            //radius
        }
    }
}

export function decodeNetworkUnit(unit: UnitTuple): DecodedUnit {
  const [
    type,
    x,
    y,
    z,
    r,
    width,
    height,
    radius,
    angle,
    hp,
    maxHP,
    targetX,
    targetY,
    colorIndex,
    isLead,
    boost,
    segmentIndex, // Server now sends segmentIndex instead of brightness for better performance
    prevUnitId,
    name, // Player name
  ] = unit

  return {
    type,
    x,
    y,
    z,
    r,
    width,
    height,
    radius,
    angle,
    hp,
    maxHP,
    targetX,
    targetY,
    colorIndex,
    isLead,
    boost,
    segmentIndex,
    prevUnitId,
    name: typeof name === 'string' ? name : '',
  }
}

export function drawDebugCircle(
  graphics: any, // PixiJS Graphics object
  gameObjects: { units: any; dynamics: any },
  options: {
    showSnakeHeads?: boolean
    showSnakeBodies?: boolean
    showFood?: boolean
    headColor?: number
    bodyColor?: number
    foodColor?: number
    lineWidth?: number
    alpha?: number
  } = {}
) {
  const {
    showSnakeHeads = true,
    showSnakeBodies = true,
    showFood = true,
    headColor = 0xff0000, // Red for snake heads
    bodyColor = 0x00ff00, // Green for snake bodies
    foodColor = 0x0000ff, // Blue for food
    lineWidth = 2,
    alpha = 0.7,
  } = options

  // Clear previous debug drawings only for debug graphics
  graphics.clear()
  graphics.alpha = alpha

  // Draw snake collision circles
  if (showSnakeHeads || showSnakeBodies) {
    for (const [, unitData] of Object.entries(gameObjects.units)) {
      if (!unitData || !Array.isArray(unitData)) continue

      const { x, y, radius, isLead } = decodeNetworkUnit(unitData)

      const isHead = isLead === 1

      if (isHead && showSnakeHeads) {
        // Snake heads use radius/2 for collision detection (as per server CheckHeadHit)
        const collisionRadius = radius / 2
        graphics.lineStyle(lineWidth, headColor)
        graphics.circle(x, y, collisionRadius)
        graphics.stroke()

        // Optional: Draw a smaller inner circle to show the difference
        graphics.lineStyle(1, headColor, 0.3)
        graphics.circle(x, y, radius)
        graphics.stroke()
      } else if (!isHead && showSnakeBodies) {
        // Snake body parts use full radius for collision detection
        graphics.lineStyle(lineWidth, bodyColor)
        graphics.circle(x, y, radius)
        graphics.stroke()
      }
    }
  }

  // Draw food collision circles
  if (showFood) {
    for (const [, foodData] of Object.entries(gameObjects.dynamics)) {
      if (!foodData || !Array.isArray(foodData)) continue

      const [, x, y, , , , , radius, ,] = foodData

      // Food uses full radius for collision detection
      graphics.lineStyle(lineWidth, foodColor)
      graphics.circle(x, y, radius)
      graphics.stroke()
    }
  }
}

/**
 * Simplified debug circle drawing for a single object.
 * Useful for debugging specific collision scenarios.
 *
 * @param graphics - PixiJS Graphics object to draw on
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param radius - Collision radius
 * @param color - Circle color (default: red)
 * @param lineWidth - Line width (default: 2)
 */
export function drawSingleDebugCircle(
  graphics: any,
  x: number,
  y: number,
  radius: number,
  color: number = 0xff0000,
  lineWidth: number = 2
) {
  graphics.lineStyle(lineWidth, color)
  graphics.circle(x, y, radius)
  graphics.stroke()
}

