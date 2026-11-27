import type { PaperDetail } from '../paper-detail';
import { addGroundShadow } from '../animals/shared';
import { shapeFrom } from './palette';

interface GiftColors {
  paper: string;
  lid: string;
  fold: string;
  ribbon: string;
  ribbonFold: string;
}

/** A paper parcel with a broad ribbon and two folded bow loops. */
export function drawGift(gift: PaperDetail, width: number, height: number, colors: GiftColors): void {
  const left = -width / 2;
  const right = width / 2;
  const lidHeight = height * 0.18;
  const lidY = height - lidHeight;
  const ribbonX = -width * 0.055;
  const ribbonWidth = width * 0.19;

  addGroundShadow(gift, width * 1.12, 0.16, '#a4aa9b');
  gift.shape(
    shapeFrom(s => {
      s.moveTo(left + 0.025, 0);
      s.lineTo(right - 0.02, 0.004);
      s.quadraticCurveTo(right, 0.006, right, 0.026);
      s.lineTo(right - 0.006, height - 0.015);
      s.lineTo(left + 0.006, height - 0.009);
      s.lineTo(left, 0.025);
      s.quadraticCurveTo(left, 0, left + 0.025, 0);
    }),
    colors.paper,
    0,
    0,
    0,
    undefined,
    0.035,
  );
  gift.cut(
    [
      [left + 0.012, 0.024],
      [right - 0.012, 0.028],
      [right - 0.012, 0.012],
      [left + 0.014, 0.007],
    ],
    colors.fold,
    0,
    0,
    0.039,
    undefined,
    0.008,
  );

  // The lid casts one clear paper edge, rather than a second box outline.
  gift.rect(width + 0.018, 0.024, colors.fold, 0, lidY - 0.012, 0.049, undefined, 0.008);
  gift.shape(
    shapeFrom(s => {
      s.moveTo(left - 0.022, lidY + 0.013);
      s.lineTo(right + 0.024, lidY + 0.017);
      s.lineTo(right + 0.016, height + 0.018);
      s.quadraticCurveTo(0, height + 0.023, left - 0.017, height + 0.012);
      s.closePath();
    }),
    colors.lid,
    0,
    0,
    0.061,
    undefined,
    0.02,
  );

  gift.cut(
    [
      [ribbonX - ribbonWidth / 2, 0.005],
      [ribbonX + ribbonWidth / 2, 0.006],
      [ribbonX + ribbonWidth / 2 + 0.007, height + 0.019],
      [ribbonX - ribbonWidth / 2 + 0.004, height + 0.019],
    ],
    colors.ribbon,
    0,
    0,
    0.088,
    undefined,
    0.012,
  );

  const bowY = height + 0.038;
  for (const side of [-1, 1]) {
    const span = width * (side === -1 ? 0.39 : 0.35);
    const rise = width * (side === -1 ? 0.25 : 0.29);
    const x = (fraction: number) => ribbonX + side * span * fraction;
    gift.shape(
      shapeFrom(s => {
        s.moveTo(ribbonX, bowY);
        s.bezierCurveTo(x(0.35), bowY + rise * 0.62, x(1.1), bowY + rise * 1.28, x(1), bowY + rise * 0.45);
        s.quadraticCurveTo(x(0.96), bowY - rise * 0.18, ribbonX, bowY - 0.006);
        s.closePath();
      }),
      colors.ribbon,
      0,
      0,
      0.112,
      undefined,
      0.016,
    );
    gift.shape(
      shapeFrom(s => {
        s.moveTo(ribbonX, bowY - 0.006);
        s.quadraticCurveTo(x(0.94), bowY - rise * 0.16, x(1), bowY + rise * 0.45);
        s.quadraticCurveTo(x(0.64), bowY + rise * 0.12, ribbonX, bowY + 0.012);
        s.closePath();
      }),
      colors.ribbonFold,
      0,
      0,
      0.132,
      undefined,
      0.008,
    );
    gift.cut(
      [
        [ribbonX + side * 0.008, bowY],
        [ribbonX + side * width * 0.2, bowY - width * 0.2],
        [ribbonX + side * width * 0.2, bowY - width * 0.08],
        [ribbonX + side * width * 0.31, bowY - width * 0.14],
        [ribbonX + side * width * 0.12, bowY + 0.014],
      ],
      colors.ribbon,
      0,
      0,
      0.149,
      undefined,
      0.012,
    );
  }
  gift.shape(
    shapeFrom(s => {
      s.moveTo(ribbonX - width * 0.07, bowY - width * 0.03);
      s.lineTo(ribbonX + width * 0.06, bowY - width * 0.025);
      s.lineTo(ribbonX + width * 0.055, bowY + width * 0.09);
      s.quadraticCurveTo(ribbonX, bowY + width * 0.11, ribbonX - width * 0.06, bowY + width * 0.075);
      s.closePath();
    }),
    colors.ribbon,
    0,
    0,
    0.166,
    undefined,
    0.014,
  );
}
