// Build-time Open Graph images. Rendered once per page by src/pages/og/[...slug].png.ts.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { NAME } from '../consts';

const WIDTH = 1200;
const HEIGHT = 630;

const BG = '#fbfaf7';
const TEXT = '#1a1917';
const MUTED = '#6b6760';

// Resolved from the project root: the build always runs from there.
const fontDir = join(process.cwd(), 'src/assets/fonts');

let fontsPromise: Promise<{ regular: Buffer; medium: Buffer }> | undefined;
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(fontDir, 'newsreader-latin-400-normal.woff')),
    readFile(join(fontDir, 'newsreader-latin-500-normal.woff')),
  ]).then(([regular, medium]) => ({ regular, medium }));
  return fontsPromise;
}

export async function renderOg({ title, subtitle }: { title: string; subtitle: string }): Promise<Buffer> {
  const { regular, medium } = await loadFonts();

  const small = { fontSize: 28, fontWeight: 400, color: MUTED };

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          boxSizing: 'border-box',
          backgroundColor: BG,
          color: TEXT,
          fontFamily: 'Newsreader',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'block',
                fontSize: 68,
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                lineClamp: 3,
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
              children: [
                { type: 'div', props: { style: small, children: subtitle } },
                { type: 'div', props: { style: small, children: NAME } },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Newsreader', data: regular, weight: 400, style: 'normal' },
        { name: 'Newsreader', data: medium, weight: 500, style: 'normal' },
      ],
    }
  );

  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}
