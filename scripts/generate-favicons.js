import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function createIcon(size, filename) {
  const png = new PNG({ width: size, height: size });

  const bgR = 10, bgG = 10, bgB = 10; // #0A0A0A
  const borderR = 255, borderG = 90, borderB = 31; // #FF5A1F (Orange)
  const fgR = 255, fgG = 255, fgB = 255; // White

  const radius = Math.floor(size * 0.2);
  const borderWidth = Math.max(2, Math.floor(size * 0.03));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Check distance from corners for rounded rectangle
      let inCorner = false;
      let cornerDist = 0;

      const left = radius;
      const right = size - 1 - radius;
      const top = radius;
      const bottom = size - 1 - radius;

      let cx = x < left ? left : (x > right ? right : x);
      let cy = y < top ? top : (y > bottom ? bottom : y);

      const dx = x - cx;
      const dy = y - cy;
      cornerDist = Math.sqrt(dx * dx + dy * dy);

      if (cornerDist > radius) {
        // Outside rounded box
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0; // transparent
        continue;
      }

      // Check border
      const isBorder = (cornerDist > radius - borderWidth) || 
                       (x < borderWidth || x >= size - borderWidth || y < borderWidth || y >= size - borderWidth);

      if (isBorder) {
        png.data[idx] = borderR;
        png.data[idx + 1] = borderG;
        png.data[idx + 2] = borderB;
        png.data[idx + 3] = 255;
        continue;
      }

      // Inside icon - background color
      let r = bgR, g = bgG, b = bgB, a = 255;

      // Draw 'N' monogram in center
      // Normalize coords inside padding
      const pad = size * 0.25;
      const w = size - pad * 2;
      const h = size - pad * 2;

      if (x >= pad && x <= size - pad && y >= pad && y <= size - pad) {
        const nx = (x - pad) / w; // 0 to 1
        const ny = (y - pad) / h; // 0 to 1

        const barW = 0.22;
        // Left vertical leg
        const isLeftLeg = (nx >= 0.05 && nx <= 0.05 + barW);
        // Right vertical leg
        const isRightLeg = (nx >= 0.95 - barW && nx <= 0.95);
        // Diagonal connecting top-left to bottom-right
        const diagDist = Math.abs(ny - nx);
        const isDiagonal = (diagDist <= barW * 0.7 && nx >= 0.05 && nx <= 0.95);

        if (isLeftLeg || isRightLeg || isDiagonal) {
          if (isDiagonal && !isLeftLeg && !isRightLeg) {
            r = borderR;
            g = borderG;
            b = borderB;
          } else {
            r = fgR;
            g = fgG;
            b = fgB;
          }
        }
      }

      // Orange dot on top right corner of the N
      const dotCenterX = size - pad * 0.8;
      const dotCenterY = pad * 0.8;
      const dotRadius = size * 0.06;
      const distToDot = Math.sqrt((x - dotCenterX) ** 2 + (y - dotCenterY) ** 2);
      if (distToDot <= dotRadius) {
        r = borderR;
        g = borderG;
        b = borderB;
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  const outputPath = path.join(process.cwd(), 'public', filename);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

createIcon(96, 'favicon.png');
createIcon(180, 'apple-touch-icon.png');
createIcon(32, 'favicon-32x32.png');
