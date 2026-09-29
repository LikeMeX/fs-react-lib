import { readFileSync } from 'fs';
import { join } from 'path';

// MessageBubble plugs remark-gfm, remark-math and rehype-katex into react-markdown.
// react-markdown 7/8 parse with unified 10; remark-gfm 4, remark-math 6 and rehype-katex 7
// target unified 11 and crash that parser on inline code, tables and $$ blocks
// ("Cannot read properties of undefined (reading 'inTable')"). Hosts with auto-install-peers
// get the highest major a range allows, so every range must stay inside one generation.
const UNIFIED_10_MAJORS: Readonly<Record<string, readonly number[]>> = {
  'react-markdown': [7, 8],
  'remark-gfm': [3],
  'remark-math': [5],
  'rehype-katex': [6],
};

type Manifest = {
  peerDependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const manifest: Manifest = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));

function majorsOf(range: string | undefined): number[] {
  if (range === undefined) throw new Error('Missing from package.json');
  return range.split('||').map((part) => {
    const match = /^\^?(\d+)(\.\d+){0,2}$/.exec(part.trim());
    if (!match) throw new Error(`Unsupported range "${part.trim()}" — write it as ^N.x.x or N`);
    return Number(match[1]);
  });
}

describe.each(Object.entries(UNIFIED_10_MAJORS))('%s', (name, allowed) => {
  test('peer range admits only unified 10 majors', () => {
    expect(allowed).toEqual(expect.arrayContaining(majorsOf(manifest.peerDependencies[name])));
  });

  test('devDependency is from the same generation', () => {
    expect(allowed).toEqual(expect.arrayContaining(majorsOf(manifest.devDependencies[name])));
  });
});
