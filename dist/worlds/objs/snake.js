"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function MLerp(start, end, amt) { return (1 - amt) * start + amt * end; }
function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}
function map(value, min, max, newMin, newMax) {
    if (min === max) {
        return newMin;
    }
    return lerp(newMin, newMax, (value - min) / (max - min));
}
const TINY = 0.0001;
class IOSnakeManager {
    constructor(world) {
        this.scale = 0.6;
        this.slowSpeed = 150;
        this.fastSpeed = this.slowSpeed * 2;
        this.rad = 16;
        this.slerp = 0.47;
        this.LevelXP = 20;
        this.colors = [
            this.rgbToHex(255, 255, 255), // white
            this.rgbToHex(255, 182, 193), // light pink
            this.rgbToHex(173, 216, 230), // light blue
            this.rgbToHex(144, 238, 144), // light green
            this.rgbToHex(255, 218, 185), // peach
            this.rgbToHex(221, 160, 221), // plum
            this.rgbToHex(255, 255, 224), // light yellow
            this.rgbToHex(176, 196, 222), // light steel blue
            this.rgbToHex(255, 192, 203), // pink
            this.rgbToHex(152, 251, 152) // pale green
        ];
        this.world = world;
    }
    rgbToHex(r, g, b) {
        const toHex = (c) => c.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    // Helper function to describe snake properties based on score/EXP
    describeSnakeFromScore(score) {
        // Calculate radius based on level (similar to original logic but smoother)
        const level = Math.floor(score / this.LevelXP);
        const baseRadius = Math.max(0.7 * Math.log10(score / 300 + 2), 0.5);
        const radius = baseRadius * 32 * this.scale;
        return {
            radius,
            spacingAtHead: Math.max(0.75 * radius, 0.5), // Minimum spacing for glow visibility
            spacingAtTail: 2.5 * radius,
            length: 64 * Math.log10(score / 256 + 1) + 3,
            turnSpeed: Math.max((360 - 100 * Math.log10(score / 150 + 1)) * Math.PI / 180, 45 * Math.PI / 180),
            level,
            scale: this.scale
        };
    }
    CreateSnake(isAI, x, y, size = 10, name, initialTx, initialTy) {
        // Use the size parameter to determine initial snake length
        const initialLength = Math.max(3, size);
        let z = 1000;
        let c = this.world.RandInt(this.colors.length - 1);
        let head = this.world.CreateUnit(1, x, y, z, 0, this.rad * 2, this.rad * 2, this.rad, this.slowSpeed, c);
        head.isAI = isAI;
        head.isLead = true;
        head.EXP = 10;
        head.bright = 0;
        head.level = Math.floor(head.EXP / this.LevelXP);
        // Ensure snake has proper initial direction toward target
        const targetX = initialTx !== undefined ? initialTx : x + 1;
        const targetY = initialTy !== undefined ? initialTy : y + 1;
        const targetAngle = Math.atan2(targetY - y, targetX - x);
        head.angle = targetAngle;
        // Set name: use provided name or generate random name for AI
        if (name) {
            head.name = name;
        }
        else if (isAI === 1) {
            head.name = "Player-" + Math.floor(Math.random() * 9000 + 1000);
        }
        else {
            head.name = "Player";
        }
        let bb = 0;
        const description = this.describeSnakeFromScore(head.EXP);
        const actualSize = Math.floor(description.length);
        // Update head size based on initial EXP
        head.radius = description.radius;
        head.w = description.radius * 2;
        head.h = description.radius * 2;
        for (let i = 0; i < Math.min(actualSize, initialLength); i++) {
            z--;
            // Calculate initial spacing based on position in snake
            const spacing = lerp(description.spacingAtHead, description.spacingAtTail, i / actualSize);
            const offsetX = x - (spacing * (i + 1));
            let p = this.world.CreateUnit(1, offsetX, y, z, 0, description.radius * 2, description.radius * 2, description.radius, this.slowSpeed, c);
            p.prevUnitId = i === 0 ? head.id : head.parts[i - 1].id;
            p.owner = head.id;
            p.isLead = false;
            p.bright = bb;
            p.segmentIndex = i + 1; // Track segment position (1-indexed, 0 is head)
            p.spacing = spacing;
            head.parts.push(p);
            bb++;
            if (bb >= 10) {
                bb = 0;
            }
        }
        return head.id;
    }
    AddEXP(head, exp) {
        head.EXP += exp;
        const description = this.describeSnakeFromScore(head.EXP);
        const newRadius = description.radius;
        // Always update radius to ensure growth
        head.radius = newRadius;
        head.w = newRadius * 2;
        head.h = newRadius * 2;
        // Mark that radius needs update - defer the actual update to avoid looping
        head.radiusNeedsUpdate = true;
        head.targetRadius = newRadius;
        if (head.isAI === 0) {
            console.log("Grow EXP: " + head.EXP + " Radius: " + newRadius + " Links: " + head.parts.length);
        }
    }
    LoseEXP(head, exp) {
        head.EXP = Math.max(head.EXP - exp, 0);
        const description = this.describeSnakeFromScore(head.EXP);
        const newRadius = description.radius;
        // Always update radius
        head.radius = newRadius;
        head.w = newRadius * 2;
        head.h = newRadius * 2;
        // Mark that radius needs update - defer the actual update to avoid looping
        head.radiusNeedsUpdate = true;
        head.targetRadius = newRadius;
        if (head.EXP > 100) {
            let tail = head.parts[head.parts.length - 1];
            let frad = 15;
            let d = this.world.CreateDynamic(1, tail.x, tail.y, 0, 0, frad * 2, frad * 2, frad, 5, head.color);
            d.origin_x = tail.x;
            d.origin_y = tail.y;
        }
    }
    moveTo(head, dt) {
        const description = this.describeSnakeFromScore(head.EXP);
        const totalLength = head.parts.length;
        const desiredLengthFloat = description.length;
        const desiredLength = Math.floor(desiredLengthFloat);
        head.bright = ((head.bright ?? 0) + 1) % 10;
        // Update radius for all parts if needed (deferred from AddEXP/LoseEXP)
        const targetRadius = head.targetRadius || description.radius;
        const radiusNeedsUpdate = head.radiusNeedsUpdate;
        // Track segments to remove instead of filtering
        let segmentsToRemove = [];
        for (let i = 0; i < head.parts.length; i++) {
            if (i >= desiredLength) {
                // Mark excess segments for removal
                head.parts[i].remove = 1;
                segmentsToRemove.push(i);
                continue;
            }
            const curr = head.parts[i];
            const previous = i === 0 ? head : head.parts[i - 1];
            curr.boost = head.boost;
            // Update radius only if needed (batch update)
            if (radiusNeedsUpdate) {
                curr.radius = targetRadius;
                curr.w = targetRadius * 2;
                curr.h = targetRadius * 2;
            }
            // Calculate dynamic spacing based on position in snake
            const spacing = map(i, 0, totalLength, description.spacingAtHead, description.spacingAtTail);
            const curSpeed = head.boost === 1 ? this.fastSpeed * 0.75 : this.slowSpeed;
            let alpha = (dt * curSpeed) / spacing;
            // For boosting, ensure tail segments don't lag too much
            if (head.boost === 1 && i > totalLength * 0.7) {
                // Boost the alpha for tail segments to prevent them from lagging
                alpha *= 1.2;
            }
            alpha = Math.max(TINY, Math.min(1 - TINY, alpha));
            // Update position
            curr.x = MLerp(curr.x, previous.x, alpha);
            curr.y = MLerp(curr.y, previous.y, alpha);
            // Update angle to face the target with smooth interpolation using slerp
            let targetAngle = Math.atan2(previous.y - curr.y, previous.x - curr.x);
            const angleDiff = targetAngle - curr.angle;
            const normalizedAngleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
            curr.angle = curr.angle + normalizedAngleDiff * this.slerp;
            curr.bright--;
            if (curr.bright < 0) {
                curr.bright = 10;
            }
        }
        // Clear the radius update flag
        if (radiusNeedsUpdate) {
            head.radiusNeedsUpdate = false;
        }
        if (totalLength < desiredLength) {
            for (let i = totalLength; i < desiredLength; i++) {
                let tail = head.parts[head.parts.length - 1];
                const newZ = tail.z - 1;
                const spawnX = tail.x + (TINY * (i + 1));
                const spawnY = tail.y;
                let p = this.world.CreateUnit(1, spawnX, spawnY, newZ, 0, description.radius * 2, description.radius * 2, description.radius, 3, head.color);
                p.owner = head.id;
                p.isLead = false;
                p.angle = tail.angle;
                p.bright = tail.bright + 1;
                p.segmentIndex = i + 1; // Store segment index on creation (1-indexed)
                head.parts.push(p);
                if ((p.bright ?? 0) >= 10) {
                    p.bright = 0;
                }
                p.prevUnitId = head.parts[head.parts.length - 2].id;
            }
        }
        // Remove excess segments that were marked for removal (only if needed)
        if (segmentsToRemove.length > 0) {
            head.parts = head.parts.filter(part => !part.remove);
        }
    }
    SimpleRotateTo(angle, target, spd) {
        let angleDifference = target - angle;
        if (angleDifference > Math.PI) {
            angleDifference -= 2 * Math.PI;
        }
        else if (angleDifference < -Math.PI) {
            angleDifference += 2 * Math.PI;
        }
        if (Math.abs(angleDifference) > spd) {
            angle += Math.sign(angleDifference) * spd;
        }
        else {
            angle = target;
        }
        return angle;
    }
    slither(head, dt) {
        const description = this.describeSnakeFromScore(head.EXP);
        let deltaX = head.tx - head.x;
        let deltaY = head.ty - head.y;
        let targetAngle = Math.atan2(deltaY, deltaX);
        let angleDifference = targetAngle - head.angle;
        if (angleDifference > Math.PI)
            angleDifference -= 2 * Math.PI;
        if (angleDifference < -Math.PI)
            angleDifference += 2 * Math.PI;
        // Use dynamic turn speed based on score
        let rotationSpeed = description.turnSpeed * dt;
        head.angle = this.SimpleRotateTo(head.angle, targetAngle, rotationSpeed);
        head.ox = head.x;
        head.oy = head.y;
        const speed = head.boost === 1 ? this.fastSpeed : head.speed;
        head.x += Math.cos(head.angle) * speed * dt;
        head.y += Math.sin(head.angle) * speed * dt;
        this.moveTo(head, dt);
    }
    DoDeath(obj) {
        this.world.DeathFood(obj.parts);
        for (let i = 0; i < obj.parts.length; i++) {
            obj.parts[i].remove = 1;
        }
    }
    CheckSnakeHeads(obj, dt) {
        let tobj, tid;
        let res = this.CheckHeadHit(obj);
        if (res !== null) {
            // Use tid to track the target that was hit
            tid = res[0]; // res[0] is the object ID string
            obj.remove = 1;
            this.DoDeath(obj);
            // Log collision with target ID for debugging
            console.log(`Snake ${obj.id} hit target ${tid}`);
            return;
        }
        if (this.world.CD.CircleCollision(obj.x, obj.y, obj.radius, this.world.w / 2, this.world.h / 2, this.world.w / 2) === false) {
            obj.remove = 1;
            this.DoDeath(obj);
            return;
        }
        let fres = this.world.CD.IsObjHitAreaOXYFaster(obj, "dynamic");
        if (fres !== null) {
            tid = fres[0];
            tobj = fres[1];
            tobj.remove = 1;
            this.AddEXP(obj, tobj.radius);
        }
        if (obj.boost === 1 && obj.EXP > 100) {
            obj.boost_time += dt;
            if (obj.boost_time >= obj.boost_cooldown) {
                this.LoseEXP(obj, 1);
                obj.boost_time = 0;
            }
        }
    }
    CheckHeadHit(d) {
        let units = this.world.CD.GetOtherObjsArea4(d.x, d.y, "unit");
        for (let [oid, obj] of Object.entries(units)) {
            if (obj.id !== d.id) {
                if (obj.owner !== d.id) {
                    if (this.world.CD.CircleCollision(d.ox, d.oy, d.radius / 2, obj.x, obj.y, obj.radius)) {
                        return [oid, obj];
                    }
                }
            }
        }
        return null;
    }
}
exports.default = IOSnakeManager;
//# sourceMappingURL=snake.js.map