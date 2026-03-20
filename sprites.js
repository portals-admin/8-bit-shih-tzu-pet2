/**
 * 8-bit Shih Tzu Sprite System
 * All sprites drawn programmatically on canvas — no external images needed.
 */

const SPRITE_SIZE = 64; // base sprite grid
const PIXEL = 4; // each "pixel" is 4x4 real pixels for that chunky 8-bit look

const COLORS = {
  body: '#f5e6d0',
  bodyDark: '#d4c4a8',
  bodyLight: '#fff5e6',
  nose: '#2a2a2a',
  eye: '#1a1a1a',
  eyeShine: '#ffffff',
  tongue: '#ff7799',
  ear: '#c9a87c',
  earDark: '#a88960',
  bow: '#ff6b9d',
  cheek: '#ffb5c5',
  pawPad: '#d4a08a',
  tail: '#d4c4a8',
};

// Pixel art grids. Each row is a string, each char maps to a color.
// ' ' = transparent, letters map to COLORS above
// We draw the dog at a higher level using shapes for clarity and control.

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * PIXEL, h * PIXEL);
}

function drawPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
}

/**
 * Draw the Shih Tzu in various poses
 * The dog is drawn on a 64x64 virtual grid (each cell = PIXEL px)
 */
const ShihTzuSprites = {
  // Draw body base shape
  _drawBody(ctx, bounceY) {
    const by = bounceY || 0;
    // Main body (oval-ish)
    drawPixelRect(ctx, 18, 28 + by, 28, 18, COLORS.body);
    drawPixelRect(ctx, 16, 30 + by, 32, 14, COLORS.body);
    drawPixelRect(ctx, 20, 26 + by, 24, 2, COLORS.bodyLight);

    // Fluffy chest
    drawPixelRect(ctx, 22, 26 + by, 20, 4, COLORS.bodyLight);
  },

  _drawHead(ctx, bounceY, tilt) {
    const by = bounceY || 0;
    const t = tilt || 0;
    // Head (big round fluffy head — Shih Tzus have big heads!)
    drawPixelRect(ctx, 18 + t, 10 + by, 28, 22, COLORS.body);
    drawPixelRect(ctx, 16 + t, 12 + by, 32, 18, COLORS.body);
    drawPixelRect(ctx, 20 + t, 8 + by, 24, 4, COLORS.body);

    // Top floof / hair poof
    drawPixelRect(ctx, 22 + t, 6 + by, 20, 4, COLORS.bodyLight);
    drawPixelRect(ctx, 26 + t, 4 + by, 12, 4, COLORS.bodyLight);

    // Hair bow
    drawPixelRect(ctx, 28 + t, 5 + by, 4, 3, COLORS.bow);
    drawPixelRect(ctx, 26 + t, 6 + by, 2, 2, COLORS.bow);
    drawPixelRect(ctx, 34 + t, 6 + by, 2, 2, COLORS.bow);
  },

  _drawFace(ctx, bounceY, tilt, eyeState) {
    const by = bounceY || 0;
    const t = tilt || 0;

    // Ears (floppy, hanging down)
    drawPixelRect(ctx, 12 + t, 14 + by, 6, 14, COLORS.ear);
    drawPixelRect(ctx, 10 + t, 16 + by, 4, 10, COLORS.ear);
    drawPixelRect(ctx, 14 + t, 16 + by, 2, 10, COLORS.earDark);

    drawPixelRect(ctx, 46 + t, 14 + by, 6, 14, COLORS.ear);
    drawPixelRect(ctx, 50 + t, 16 + by, 4, 10, COLORS.ear);
    drawPixelRect(ctx, 46 + t, 16 + by, 2, 10, COLORS.earDark);

    // Eyes
    if (eyeState === 'closed' || eyeState === 'sleep') {
      // Closed eyes — happy lines
      drawPixelRect(ctx, 22 + t, 19 + by, 6, 1, COLORS.eye);
      drawPixelRect(ctx, 36 + t, 19 + by, 6, 1, COLORS.eye);
      if (eyeState === 'closed') {
        // Happy curved lines
        drawPixel(ctx, 21 + t, 18 + by, COLORS.eye);
        drawPixel(ctx, 28 + t, 18 + by, COLORS.eye);
        drawPixel(ctx, 35 + t, 18 + by, COLORS.eye);
        drawPixel(ctx, 42 + t, 18 + by, COLORS.eye);
      }
    } else if (eyeState === 'wide') {
      // Excited big eyes
      drawPixelRect(ctx, 22 + t, 16 + by, 6, 6, COLORS.eye);
      drawPixelRect(ctx, 36 + t, 16 + by, 6, 6, COLORS.eye);
      drawPixelRect(ctx, 24 + t, 17 + by, 2, 2, COLORS.eyeShine);
      drawPixelRect(ctx, 38 + t, 17 + by, 2, 2, COLORS.eyeShine);
    } else {
      // Normal eyes
      drawPixelRect(ctx, 22 + t, 17 + by, 5, 5, COLORS.eye);
      drawPixelRect(ctx, 37 + t, 17 + by, 5, 5, COLORS.eye);
      drawPixelRect(ctx, 23 + t, 18 + by, 2, 2, COLORS.eyeShine);
      drawPixelRect(ctx, 38 + t, 18 + by, 2, 2, COLORS.eyeShine);
    }

    // Cheek blush
    drawPixelRect(ctx, 18 + t, 22 + by, 4, 2, COLORS.cheek);
    drawPixelRect(ctx, 42 + t, 22 + by, 4, 2, COLORS.cheek);

    // Nose
    drawPixelRect(ctx, 29 + t, 22 + by, 6, 4, COLORS.nose);
    drawPixelRect(ctx, 30 + t, 21 + by, 4, 1, COLORS.nose);

    // Mouth
    drawPixelRect(ctx, 30 + t, 27 + by, 1, 1, COLORS.nose);
    drawPixelRect(ctx, 33 + t, 27 + by, 1, 1, COLORS.nose);
    drawPixelRect(ctx, 31 + t, 28 + by, 2, 1, COLORS.nose);
  },

  _drawLegs(ctx, bounceY, walkFrame) {
    const by = bounceY || 0;
    const wf = walkFrame || 0;
    const legOffsets = [0, 0, 0, 0];
    if (wf === 1) { legOffsets[0] = -1; legOffsets[3] = -1; }
    if (wf === 2) { legOffsets[1] = -1; legOffsets[2] = -1; }

    // Front legs
    drawPixelRect(ctx, 20, 44 + by + legOffsets[0], 6, 10, COLORS.body);
    drawPixelRect(ctx, 38, 44 + by + legOffsets[1], 6, 10, COLORS.body);
    // Back legs
    drawPixelRect(ctx, 16, 42 + by + legOffsets[2], 6, 12, COLORS.bodyDark);
    drawPixelRect(ctx, 42, 42 + by + legOffsets[3], 6, 12, COLORS.bodyDark);

    // Paw pads
    drawPixelRect(ctx, 20, 52 + by + legOffsets[0], 6, 2, COLORS.pawPad);
    drawPixelRect(ctx, 38, 52 + by + legOffsets[1], 6, 2, COLORS.pawPad);
    drawPixelRect(ctx, 16, 52 + by + legOffsets[2], 6, 2, COLORS.pawPad);
    drawPixelRect(ctx, 42, 52 + by + legOffsets[3], 6, 2, COLORS.pawPad);
  },

  _drawTail(ctx, bounceY, wagFrame) {
    const by = bounceY || 0;
    const wag = wagFrame || 0;
    // Tail — fluffy and curved up
    const tx = wag === 1 ? 2 : wag === 2 ? -2 : 0;
    drawPixelRect(ctx, 46 + tx, 28 + by, 4, 4, COLORS.tail);
    drawPixelRect(ctx, 48 + tx, 24 + by, 4, 6, COLORS.bodyLight);
    drawPixelRect(ctx, 50 + tx, 22 + by, 4, 4, COLORS.bodyLight);
  },

  _drawTongue(ctx, bounceY, tilt, show) {
    if (!show) return;
    const by = bounceY || 0;
    const t = tilt || 0;
    drawPixelRect(ctx, 31 + t, 29 + by, 2, 3, COLORS.tongue);
    drawPixelRect(ctx, 30 + t, 31 + by, 4, 1, COLORS.tongue);
  },

  // === ANIMATION STATES ===

  idle(ctx, frame) {
    const breathe = Math.sin(frame * 0.05) * 0.5;
    const by = Math.round(breathe);
    const tailWag = Math.floor(frame / 15) % 3;

    this._drawTail(ctx, by, tailWag);
    this._drawBody(ctx, by);
    this._drawLegs(ctx, by, 0);
    this._drawHead(ctx, by, 0);
    this._drawFace(ctx, by, 0, 'normal');
  },

  happy(ctx, frame) {
    const bounce = Math.abs(Math.sin(frame * 0.15)) * 3;
    const by = -Math.round(bounce);
    const tailWag = Math.floor(frame / 5) % 3;
    const tilt = Math.sin(frame * 0.1) > 0.5 ? 1 : 0;

    this._drawTail(ctx, by, tailWag);
    this._drawBody(ctx, by);
    this._drawLegs(ctx, by, Math.floor(frame / 8) % 3);
    this._drawHead(ctx, by, tilt);
    this._drawFace(ctx, by, tilt, 'closed');
    this._drawTongue(ctx, by, tilt, true);
  },

  petting(ctx, frame) {
    const squish = Math.sin(frame * 0.2) * 1;
    const by = Math.round(squish) + 1;
    const tailWag = Math.floor(frame / 4) % 3;

    this._drawTail(ctx, by, tailWag);
    this._drawBody(ctx, by);
    this._drawLegs(ctx, by, 0);
    this._drawHead(ctx, by + 1, 0);
    this._drawFace(ctx, by + 1, 0, 'closed');
    this._drawTongue(ctx, by + 1, 0, true);
  },

  eating(ctx, frame) {
    const headBob = Math.abs(Math.sin(frame * 0.3)) * 2;
    const by = 0;

    this._drawTail(ctx, by, Math.floor(frame / 6) % 3);
    this._drawBody(ctx, by);
    this._drawLegs(ctx, by, 0);
    this._drawHead(ctx, Math.round(headBob), 0);
    this._drawFace(ctx, Math.round(headBob), 0, frame % 10 < 5 ? 'normal' : 'closed');
  },

  playing(ctx, frame) {
    const jumpPhase = Math.sin(frame * 0.12);
    const jump = jumpPhase > 0 ? -jumpPhase * 6 : 0;
    const by = Math.round(jump);
    const walkF = Math.floor(frame / 6) % 3;
    const tailWag = Math.floor(frame / 3) % 3;

    this._drawTail(ctx, by, tailWag);
    this._drawBody(ctx, by);
    this._drawLegs(ctx, by, walkF);
    this._drawHead(ctx, by, 0);
    this._drawFace(ctx, by, 0, 'wide');
    this._drawTongue(ctx, by, 0, true);
  },

  sleeping(ctx, frame) {
    const breathe = Math.sin(frame * 0.03) * 0.8;
    const by = Math.round(breathe) + 4; // lower position, lying down

    // Sleeping body — flattened
    drawPixelRect(ctx, 14, 38 + by, 36, 10, COLORS.body);
    drawPixelRect(ctx, 12, 40 + by, 40, 8, COLORS.body);

    // Curled up legs (tucked in)
    drawPixelRect(ctx, 14, 46 + by, 8, 6, COLORS.bodyDark);
    drawPixelRect(ctx, 42, 46 + by, 8, 6, COLORS.bodyDark);
    drawPixelRect(ctx, 14, 50 + by, 8, 2, COLORS.pawPad);
    drawPixelRect(ctx, 42, 50 + by, 8, 2, COLORS.pawPad);

    // Tail curled around
    drawPixelRect(ctx, 46, 36 + by, 6, 4, COLORS.bodyLight);
    drawPixelRect(ctx, 50, 34 + by, 4, 4, COLORS.bodyLight);

    // Head resting on paws
    drawPixelRect(ctx, 18, 30 + by, 28, 14, COLORS.body);
    drawPixelRect(ctx, 16, 32 + by, 32, 10, COLORS.body);
    drawPixelRect(ctx, 22, 28 + by, 20, 4, COLORS.bodyLight);

    // Ears flopped
    drawPixelRect(ctx, 12, 32 + by, 6, 10, COLORS.ear);
    drawPixelRect(ctx, 46, 32 + by, 6, 10, COLORS.ear);

    // Closed sleepy eyes
    drawPixelRect(ctx, 24, 37 + by, 5, 1, COLORS.eye);
    drawPixelRect(ctx, 37, 37 + by, 5, 1, COLORS.eye);

    // Nose
    drawPixelRect(ctx, 30, 39 + by, 4, 3, COLORS.nose);

    // Cheeks
    drawPixelRect(ctx, 20, 39 + by, 3, 2, COLORS.cheek);
    drawPixelRect(ctx, 41, 39 + by, 3, 2, COLORS.cheek);

    // Bow
    drawPixelRect(ctx, 28, 28 + by, 4, 2, COLORS.bow);
  },
};

// Background / scene drawing
function drawScene(ctx, canvasW, canvasH, frame) {
  // Sky gradient (drawn as pixel bands)
  const skyColors = ['#1a1a2e', '#1e1e38', '#222244', '#262650', '#2a2a5c'];
  const bandH = canvasH / skyColors.length;
  for (let i = 0; i < skyColors.length; i++) {
    ctx.fillStyle = skyColors[i];
    ctx.fillRect(0, i * bandH, canvasW, bandH + 1);
  }

  // Stars (twinkling)
  const stars = [
    [20, 15], [60, 25], [100, 10], [150, 30], [200, 18],
    [30, 40], [170, 45], [220, 12], [240, 38], [80, 48],
    [130, 20], [180, 8], [50, 55], [110, 42],
  ];
  for (const [sx, sy] of stars) {
    const twinkle = Math.sin(frame * 0.03 + sx) > 0.3;
    if (twinkle) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(sx % canvasW, sy, 2, 2);
    }
  }

  // Ground
  ctx.fillStyle = '#3a5a3a';
  ctx.fillRect(0, canvasH - 30, canvasW, 30);
  ctx.fillStyle = '#4a7a4a';
  ctx.fillRect(0, canvasH - 30, canvasW, 4);

  // Grass tufts
  ctx.fillStyle = '#5a9a5a';
  for (let gx = 0; gx < canvasW; gx += 14) {
    const gh = 3 + Math.sin(gx + frame * 0.02) * 1;
    ctx.fillRect(gx, canvasH - 32, 2, gh);
    ctx.fillRect(gx + 4, canvasH - 31, 2, gh - 1);
  }

  // Tiny flowers
  const flowerColors = ['#ff6b9d', '#f7c948', '#ff9a76', '#a8d8ea'];
  for (let fx = 10; fx < canvasW; fx += 40) {
    ctx.fillStyle = flowerColors[(fx / 40 | 0) % flowerColors.length];
    ctx.fillRect(fx, canvasH - 34, 3, 3);
    ctx.fillStyle = '#5a9a5a';
    ctx.fillRect(fx + 1, canvasH - 31, 1, 4);
  }
}
