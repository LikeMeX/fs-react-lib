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
  const appRaw = app?.rawColors || {};

  const colorsSemantic = {
    text: {
      strong: 'color-mix(in srgb, var(--color-baseLight-500) 90%, transparent)',
      weak: 'color-mix(in srgb, var(--color-baseLight-500) 65%, transparent)',
      brand: raw.primary[500],
      secondaryBrand: raw.deepPink[500],
      disabled: 'color-mix(in srgb, var(--color-baseLight-500) 10%, transparent)',
      error: raw.red[700],
      warning: raw.yellow[700],
      success: raw.green[700],
      inverseStrong: raw.neutral[50],
      inverseWeak: 'color-mix(in srgb, var(--color-neutral-50) 78%, transparent)',
      inverseDisabled: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
      progressInCard: raw.neutralSecondary[400],
      openEnded: raw.accent.blueViolet[500],
      choice: raw.accent.burntOrange[500],
      apprenticeship: raw.accent.forestGreen[500],
      orientation: raw.accent.vividGreen[500],
      simulatedTraining: raw.accent.blueViolet[500],
      crossTraining: raw.info[500],
    },
    stroke: {
      strong: 'color-mix(in srgb, var(--color-baseLight-500) 45%, transparent)',
      weak: 'color-mix(in srgb, var(--color-baseLight-500) 10%, transparent)',
      selected: raw.primary[500],
      focus: raw.primary[500],
      disabled: 'color-mix(in srgb, var(--color-baseLight-500) 10%, transparent)',
      brandStrong: 'color-mix(in srgb, var(--color-primary-500) 80%, transparent)',
      brandWeak: 'color-mix(in srgb, var(--color-primary-500) 20%, transparent)',
      secondaryBrandStrong: raw.deepPink[500],
      secondaryBrandWeak: 'color-mix(in srgb, var(--color-deepPink-500) 20%, transparent)',
      errorStrong: raw.red[500],
      errorWeak: 'color-mix(in srgb, var(--color-red-500) 20%, transparent)',
      warningStrong: raw.yellow[500],
      warningWeak: 'color-mix(in srgb, var(--color-yellow-500) 20%, transparent)',
      successStrong: raw.green[500],
      successWeak: 'color-mix(in srgb, var(--color-green-500) 20%, transparent)',
      inverseStrong: 'color-mix(in srgb, var(--color-neutral-50) 60%, transparent)',
      inverseWeak: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
      inverseDisabled: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
      openEnded: 'color-mix(in srgb, var(--color-blueViolet-500) 20%, transparent)',
      choice: 'color-mix(in srgb, var(--color-burntOrange-500) 20%, transparent)',
    },
    icon: {
      neutral: 'color-mix(in srgb, var(--color-baseLight-500) 65%, transparent)',
      brand: 'color-mix(in srgb, var(--color-primary-500) 80%, transparent)',
      secondaryBrand: 'color-mix(in srgb, var(--color-deepPink-500) 80%, transparent)',
      disabled: 'color-mix(in srgb, var(--color-baseLight-500) 10%, transparent)',
      error: raw.red[500],
      warning: raw.yellow[500],
      success: raw.green[500],
      inverse: 'color-mix(in srgb, var(--color-neutral-50) 60%, transparent)',
      inverseStrong: raw.neutral[50],
      inverseDisabled: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
      apprenticeship: raw.accent.forestGreen[500],
      orientation: raw.accent.vividGreen[500],
      simulatedTraining: raw.accent.blueViolet[500],
      crossTraining: raw.info[500],
    },
    fill: {
      strong: 'color-mix(in srgb, var(--color-baseLight-500) 90%, transparent)',
      weak: 'color-mix(in srgb, var(--color-baseLight-500) 4%, transparent)',
      weaker: 'color-mix(in srgb, var(--color-baseLight-500) 2%, transparent)',
      hover: 'color-mix(in srgb, var(--color-baseLight-500) 45%, transparent)',
      click: 'color-mix(in srgb, var(--color-baseLight-500) 10%, transparent)',
      selected: raw.primary[500],
      disabled: 'color-mix(in srgb, var(--color-baseLight-500) 10%, transparent)',
      overlay: 'color-mix(in srgb, var(--color-baseLight-500) 45%, transparent)',
      brandStrong: raw.primary[500],
      brandWeak: 'color-mix(in srgb, var(--color-primary-500) 5%, transparent)',
      secondaryBrandStrong: raw.deepPink[500],
      secondaryBrandWeak: 'color-mix(in srgb, var(--color-deepPink-500) 5%, transparent)',
      errorStrong: raw.red[500],
      errorWeak: 'color-mix(in srgb, var(--color-red-500) 5%, transparent)',
      warningStrong: raw.yellow[500],
      warningWeak: 'color-mix(in srgb, var(--color-yellow-500) 5%, transparent)',
      successStrong: raw.green[500],
      successWeak: 'color-mix(in srgb, var(--color-green-500) 5%, transparent)',
      inverseStrong: raw.neutral[50],
      inverseWeak: 'color-mix(in srgb, var(--color-neutral-50) 6%, transparent)',
      inverseHover: 'color-mix(in srgb, var(--color-neutral-50) 6%, transparent)',
      inversePress: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
      inverseDisabled: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
      white: raw.neutral[50],
      openEnded: 'color-mix(in srgb, var(--color-blueViolet-500) 5%, transparent)',
      choice: 'color-mix(in srgb, var(--color-burntOrange-500) 5%, transparent)',
      apprenticeship: 'color-mix(in srgb, var(--color-forestGreen-500) 5%, transparent)',
      orientation: 'color-mix(in srgb, var(--color-vividGreen-500) 5%, transparent)',
      simulatedTraining: 'color-mix(in srgb, var(--color-blueViolet-500) 5%, transparent)',
      crossTraining: 'color-mix(in srgb, var(--color-info-500) 5%, transparent)',
    },
    background: {
      base: raw.neutral[50],
      raised: raw.neutral[50],
      overlay: raw.neutral[50],
      sunken: raw.neutral[100],
      alternate: raw.neutral[100],
      brand: raw.primary[500],
      inverse: raw.neutralAnalogous[900],
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
          colorsSemantic,
        },
      },
    },
  };
};