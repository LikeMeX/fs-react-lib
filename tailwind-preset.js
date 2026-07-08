/**
 * Usage:
 *   const createPreset = require('@likemex/fs-react-lib/tailwind-preset');
 *   module.exports = { presets: [createPreset('fsBizPanel')], content: [...] };
 *   // or createPreset() for core-only (no panel-specific tokens)
 *
 * ⚠️ Requires these CSS custom properties to be defined somewhere in the consuming
 * app's global CSS (used by color-mix() values below):
 *   --color-primary-500, --color-primary-300  (mainBrand)
 *   --color-deepPink-500, --color-deepPink-300 (secondaryBrand)
 *   --color-neutral-50                         (basicBase.dark)
 *   --color-blueViolet-500, --color-burntOrange-500,
 *   --color-forestGreen-50/500, --color-vividGreen-50/500,
 *   --color-info-50/500                        (assessment/ojt — now core, every panel)
 * This package does NOT currently ship that CSS — see colors.js header, "OPEN QUESTION".
 *
 * ⚠️ colorsSemantic is precomputed as a plain object, NOT a Tailwind theme() callback —
 * verified by build test that Tailwind v3 doesn't invoke functions nested as a colors
 * sub-key (see project notes / chat history for the full mechanism explanation).
 *
 * REVISION: assessment/ojt (and their colorsSemantic entries: openEnded, choice,
 * apprenticeship, orientation, simulatedTraining, crossTraining) were promoted from
 * fs-biz-panel-only to core — team decision, anticipating future panels will need
 * Assessment/OJT tag colors too. They're now baked directly into the base
 * `colorsSemantic` below and always spread into every panel's colors, no per-panel
 * extension merging needed anymore for this case.
 */
const tokens = require('./colors');

module.exports = function createPreset(appName) {
  const app = appName ? tokens.apps[appName] : undefined;
  if (appName && !app) {
    throw new Error(
      `[design-tokens] Unknown app namespace "${appName}". ` +
      `Available: ${Object.keys(tokens.apps).join(', ') || '(none defined yet)'}`
    );
  }

  const raw = tokens.core.raw;
  const semantic = tokens.core.semantic;
  const ext = tokens.core.themeExtensions;
  const neutralSolid = ext.neutralSolid(raw);
  const appRaw = app?.rawColors || {};

  const colorsSemantic = {
    light: {
      text: {
        strong: ext.basicBase.light[1000], weak: ext.basicBase.light[700],
        brand: ext.mainBrand.light[1000], secondaryBrand: ext.secondaryBrand.light[1000],
        disabled: ext.basicBase.light[100], error: raw.red[700],
        warning: raw.yellow[700], success: raw.green[700],
        inverseStrong: raw.neutral[50], inverseWeak: 'rgba(25, 25, 25, 0.78)',
        inverseDisabled: ext.basicBase.dark[100], progressInCard: raw.neutralSecondary[400],
        openEnded: ext.assessment.openEnded[1000], choice: ext.assessment.choice[1000],
        apprenticeship: ext.ojt.apprenticeship[1000], orientation: ext.ojt.orientation[1000],
        simulatedTraining: ext.ojt.simulatedTraining[1000], crossTraining: ext.ojt.crossTraining[1000],
      },
      stroke: {
        strong: ext.basicBase.light[500], weak: ext.basicBase.light[100],
        selected: ext.mainBrand.light[1000], focus: ext.mainBrand.light[1000],
        disabled: ext.basicBase.light[100], brandStrong: ext.mainBrand.light[800],
        brandWeak: ext.mainBrand.light[200], secondaryBrandStrong: ext.secondaryBrand.light[800],
        secondaryBrandWeak: ext.secondaryBrand.light[200], errorStrong: raw.red[500],
        errorWeak: 'rgba(255, 55, 51, 0.2)', warningStrong: raw.yellow[500],
        warningWeak: 'rgba(237, 181, 0, 0.2)', successStrong: raw.green[500],
        successWeak: 'rgba(0, 179, 90, 0.2)', inverseStrong: ext.basicBase.dark[500],
        inverseWeak: ext.basicBase.dark[100], inverseDisabled: ext.basicBase.dark[100],
        openEnded: ext.assessment.openEnded[200], choice: ext.assessment.choice[200],
      },
      icon: {
        neutral: ext.basicBase.light[700], brand: ext.mainBrand.light[800],
        secondaryBrand: ext.secondaryBrand.light[800], disabled: ext.basicBase.light[100],
        error: raw.red[500], warning: raw.yellow[500], success: raw.green[500],
        inverse: ext.basicBase.light[500], inverseStrong: raw.neutral[50],
        inverseDisabled: ext.basicBase.dark[100],
        apprenticeship: ext.ojt.apprenticeship[1000], orientation: ext.ojt.orientation[1000],
        simulatedTraining: ext.ojt.simulatedTraining[1000], crossTraining: ext.ojt.crossTraining[1000],
      },
      fill: {
        strong: ext.basicBase.light[1000], weak: ext.basicBase.light[50],
        weaker: ext.basicBase.light[25], hover: ext.basicBase.light[50],
        click: ext.basicBase.light[100], selected: ext.mainBrand.light[1000],
        disabled: ext.basicBase.light[100], overlay: ext.basicBase.light[500],
        brandStrong: ext.mainBrand.light[1000], brandWeak: ext.mainBrand.light[50],
        secondaryBrandStrong: ext.secondaryBrand.light[1000], secondaryBrandWeak: ext.secondaryBrand.light[50],
        errorStrong: raw.red[500], errorWeak: 'rgba(255, 55, 51, 0.05)',
        warningStrong: raw.yellow[500], warningWeak: 'rgba(237, 181, 0, 0.05)',
        successStrong: raw.green[500], successWeak: 'rgba(0, 179, 90, 0.05)',
        inverseStrong: raw.neutral[50], inverseWeak: ext.basicBase.dark[50],
        inverseHover: ext.basicBase.dark[50], inversePress: ext.basicBase.dark[100],
        inverseDisabled: ext.basicBase.dark[100], white: raw.neutral[50],
        openEnded: ext.assessment.openEnded[50], choice: ext.assessment.choice[50],
        apprenticeship: ext.ojt.apprenticeship[50], orientation: ext.ojt.orientation[50],
        simulatedTraining: ext.ojt.simulatedTraining[50], crossTraining: ext.ojt.crossTraining[50],
      },
      background: {
        base: raw.neutral[50], raised: raw.neutral[50], overlay: raw.neutral[50],
        sunken: raw.neutral[100], alternate: raw.neutral[100],
        brand: ext.mainBrand.light[1000], inverse: raw.neutralAnalogous[900],
      },
    },
    dark: {
      text: {
        strong: raw.neutral[50], weak: ext.basicBase.dark[700],
        brand: ext.mainBrand.dark[1000], secondaryBrand: ext.secondaryBrand.dark[1000],
        disabled: ext.basicBase.dark[100], error: raw.red[200],
        warning: raw.yellow[200], success: raw.green[200],
        inverseStrong: ext.basicBase.light[1000], inverseWeak: ext.basicBase.light[700],
        inverseDisabled: ext.basicBase.light[100], progressInCard: raw.neutralSecondary[100],
        openEnded: ext.assessment.openEnded[1000], choice: ext.assessment.choice[1000],
        apprenticeship: ext.ojt.apprenticeship[1000], orientation: ext.ojt.orientation[1000],
        simulatedTraining: ext.ojt.simulatedTraining[1000], crossTraining: ext.ojt.crossTraining[1000],
      },
      stroke: {
        strong: ext.basicBase.dark[500], weak: ext.basicBase.dark[100],
        selected: ext.mainBrand.dark[1000], focus: ext.mainBrand.dark[1000],
        disabled: ext.basicBase.dark[100], brandStrong: ext.mainBrand.dark[800],
        brandWeak: ext.mainBrand.dark[200], secondaryBrandStrong: ext.secondaryBrand.dark[800],
        secondaryBrandWeak: ext.secondaryBrand.dark[200], errorStrong: raw.red[200],
        errorWeak: 'rgba(249, 154, 155, 0.2)', warningStrong: raw.yellow[200],
        warningWeak: 'rgba(245, 217, 124, 0.2)', successStrong: raw.green[200],
        successWeak: 'rgba(152, 217, 172, 0.2)', inverseStrong: ext.basicBase.light[500],
        inverseWeak: ext.basicBase.light[100], inverseDisabled: ext.basicBase.light[100],
        openEnded: ext.assessment.openEnded[200], choice: ext.assessment.choice[200],
      },
      icon: {
        neutral: ext.basicBase.dark[500], brand: ext.mainBrand.dark[800],
        secondaryBrand: ext.secondaryBrand.dark[800], disabled: ext.basicBase.dark[100],
        error: raw.red[200], warning: raw.yellow[200], success: raw.green[200],
        inverse: ext.basicBase.light[500], inverseStrong: ext.basicBase.light[1000],
        inverseDisabled: ext.basicBase.light[100],
        apprenticeship: ext.ojt.apprenticeship[1000], orientation: ext.ojt.orientation[1000],
        simulatedTraining: ext.ojt.simulatedTraining[1000], crossTraining: ext.ojt.crossTraining[1000],
      },
      fill: {
        strong: raw.neutral[50], weak: ext.basicBase.dark[50],
        weaker: ext.basicBase.dark[25], hover: ext.basicBase.dark[50],
        click: ext.basicBase.dark[100], selected: raw.purpleDeep[500],
        disabled: ext.basicBase.dark[100], overlay: ext.basicBase.dark[700],
        brandStrong: raw.purpleDeep[500],
        openEnded: ext.assessment.openEnded[50], choice: ext.assessment.choice[50],
        apprenticeship: ext.ojt.apprenticeship[50], orientation: ext.ojt.orientation[50],
        simulatedTraining: ext.ojt.simulatedTraining[50], crossTraining: ext.ojt.crossTraining[50],
      },
      background: {
        base: raw.neutralAnalogous[900], raised: ext.secondaryBrand.dark[1000],
        overlay: ext.secondaryBrand.dark[1000], sunken: raw.neutralNoble[900],
        alternate: ext.secondaryBrand.dark[800], brand: raw.purpleDeep[500],
        inverse: raw.neutral[50],
      },
    },
  };

  return {
    theme: {
      extend: {
        colors: {
          ...raw,
          ...appRaw,
          // Merge the numbered CSS-var scale (bg-primary-500 etc, live theme-switchable)
          // with the named semantic states (bg-primary, bg-primary-hover, etc, hardcoded
          // hex) into ONE `primary` key — Tailwind allows mixing numeric and named keys
          // in the same color object (we already do this for `black`, `yellow`, etc).
          primary: { ...raw.primary, ...semantic.primary },
          background: semantic.background,
          foreground: semantic.foreground,
          mainBrand: ext.mainBrand,
          secondaryBrand: ext.secondaryBrand,
          neutralSolid,
          basicBase: ext.basicBase,
          assessment: ext.assessment,
          ojt: ext.ojt,
          colorsSemantic,
        },
      },
    },
  };
};