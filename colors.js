module.exports = {
  core: {
    raw: {
      neutral: {
        50: '#ffffff', 100: '#fafafa', 200: '#f5f5f5', 300: '#f4f6f9',
        400: '#d9d9d9', 500: '#bfbfbf', 600: '#8c8c8c', 700: '#595959',
        800: '#262626', 900: '#0a0f18',
      },
      gray: {
        50: '#ffffff', 100: '#fafafa', 200: '#f5f5f5', 300: '#f4f6f9',
        400: '#d9d9d9', 500: '#bfbfbf', 600: '#8c8c8c', 700: '#595959',
        800: '#262626', 900: '#0a0f18',
        status: '#333C4F', header: '#9B9B9B', divide: '#383838', subtitle: '#535353',
        upload: '#F1F1F1', menu: '#ADADAD', email: '#9C9C9E', overview: '#4F4F4F',
      },
      neutralSecondary: {
        50: '#ebedf6', 100: '#cdd4e0', 200: '#afb7c8', 300: '#909baf',
        400: '#7a869d', 500: '#63718b', 600: '#56637a', 700: '#455064',
        800: '#363e4e', 900: '#232a37',
      },
      neutralAnalogous: {
        50: '#f3f9ff', 100: '#ecf3ff', 200: '#e3eafa', 300: '#d4daea',
        400: '#b0b7c6', 500: '#9197a6', 600: '#686f7c', 700: '#555b68',
        800: '#363c49', 900: '#161c27',
      },
      primary: {
        50: 'var(--color-primary-50)', 100: 'var(--color-primary-100)', 200: 'var(--color-primary-200)',
        300: 'var(--color-primary-300)', 400: 'var(--color-primary-400)', 500: 'var(--color-primary-500)',
        600: 'var(--color-primary-600)', 700: 'var(--color-primary-700)', 800: 'var(--color-primary-800)',
        900: 'var(--color-primary-900)',
        main: 'var(--color-primary-500)', text: 'var(--color-primary-500)',
        unlock: '#8337FF', logo: '#49236B', overview: '#5B13F4', overview2: '#7D18FE',
      },

      purple: {
        50: '#F1E7FB', 100: '#DBC5F5', 200: '#C39EEF', 300: '#AB74E9',
        400: '#9852E3', 500: '#842CDD', 600: '#7A27D6', 700: '#6C1CCD',
        800: '#5E13C7', 900: '#4900B9',
      },

      // ⚠️ RE-OPENED (was "CONFIRMED by team decision: File A's scale chosen over
      // B/C's muted family") — fs-content-panel's real current file uses the OTHER
      // (B's typo'd, muted #884196) family instead. Holding at the original decision's
      // value below pending explicit UX/dev confirmation — do not silently pick either.
      purpleDeep: {
        50: '#f8f0ff', 100: '#f7f0ff', 200: '#e9d6ff', 300: '#cfadff',
        400: '#b485ff', 500: '#975DFF', 600: '#7343d9', 700: '#542eb3',
        800: '#391d8c', 900: '#261466',
      },

      pink: {
        50: '#fbe3eb', 100: '#f6b9ce', 200: '#f08cae', 300: '#eb5e8f',
        400: '#e63a76', 500: '#e2105f', 600: '#d10e5c', 700: '#bc0c57',
        800: '#a70853', 900: '#82044b',
      },

      green: {
        50: '#e5f6ea', 100: '#c1e8cc', 200: '#98d9ac', 300: '#6aca8b',
        400: '#44bf72', 500: '#00b35A', 600: '#00a450', 700: '#009244',
        800: '#008038', 900: '#006124',
      },

      yellow: {
        50: '#fffce6', 100: '#fff2a8', 200: '#f5d97c', 300: '#f1cc46',
        400: '#efc018', 500: '#edb500', 600: '#eda800', 700: '#ed9600',
        800: '#ed8500', 900: '#ed6500', status: '#FFE2AA',
      },

      red: {
        50: '#ffebef', 100: '#ffcdd4', 200: '#f99a9b', 300: '#ff4d50',
        400: '#ff3733', 500: '#ff3733', 600: '#f72d34', 700: '#e41f2d',
        800: '#d71426', 900: '#c80019',
      },

      deepPink: {
        50: '#ffe6ee', 100: '#ffbdd6', 200: '#ff94c1', 300: '#ff6bae',
        400: '#ff429e', 500: '#FF1A8F', 600: '#D90b7c', 700: '#b30068',
        800: '#8C0056', 900: '#660042',
      },
      hotPink: {
        50: '#fff0f5', 100: '#fff0f6', 200: '#ffdeec', 300: '#ffb5d6',
        400: '#fc8bc2', 500: '#EF5DA8', 600: '#c9448e', 700: '#a32f73',
        800: '#7d1e59', 900: '#57143f',
      },
      orange: {
        50: '#fff6e6', 100: '#ffe3ba', 200: '#ffcf91', 300: '#ffb969',
        400: '#ff9f40', 500: '#FD8116', 600: '#d66209', 700: '#b04600',
        800: '#8a3200', 900: '#632100',
      },
      orangeRed: {
        50: '#fff6f0', 100: '#ffdec9', 200: '#ffc2a1', 300: '#ffa378',
        400: '#fc804e', 500: '#F05623', 600: '#c93b14', 700: '#a32508',
        800: '#7d1300', 900: '#570a00',
      },
      violet: {
        50: '#f4edff', 100: '#d8c4ff', 200: '#b99cff', 300: '#9873ff',
        400: '#744aff', 500: '#4E20FF', 600: '#3311d9', 700: '#1c05b3',
        800: '#0e008c', 900: '#070066',
      },
      blue: {
        50: '#e6fbff', 100: '#b3f1ff', 200: '#8ae6ff', 300: '#61d7ff',
        400: '#36bff5', 500: '#0EA5E9', 600: '#027fc2', 700: '#00609c',
        800: '#004475', 900: '#002b4f',
      },
      deepBlue: {
        50: '#e6f2ff', 100: '#a3ceff', 200: '#7ab4ff', 300: '#5297ff',
        400: '#2977ff', 500: '#0051F7', 600: '#003fd1', 700: '#002eab',
        800: '#001f85', 900: '#00135e',
      },
      lightGreen: {
        50: '#e6ffe6', 100: '#a9f5ad', 200: '#7be884', 300: '#51db61',
        400: '#2bcf44', 500: '#0AC12D', 600: '#009c22', 700: '#00751d',
        800: '#004f16', 900: '#00290d',
      },
      cdgGreen: {
        50: '#eefced', 100: '#e2f0e1', 200: '#c5e3c6', 300: '#6d9470',
        400: '#2bcf44', 500: '#16351A', 600: '#122915', 700: '#021905',
        800: '#001100', 900: '#000900',
      },
      cyan: {
        50: '#E6FFFB', 100: '#B5F5EC', 200: '#87E8DE', 300: '#5CDBD3',
        400: '#36CFC9', 500: '#13C2C2', 600: '#08979C', 700: '#006D75',
        800: '#00474F', 900: '#002329',
      },
      neutralNoble: {
        50: '#CDCDCD', 100: '#7C7C7C', 200: '#565656', 300: '#404040',
        400: '#2D2D2D', 500: '#101010', 600: '#0E0E0E', 700: '#0C0C0C',
        800: '#060606', 900: '#000000',
      },
      pinkLady: {
        50: '#FEFAFA', 100: '#FFF0F0', 200: '#FFF0F1', 300: '#FFF0F2',
        400: '#FFDEE3', 500: '#FDB4C2', 600: '#D68D9E', 700: '#B06B7E',
        800: '#8A4D5F', 900: '#633746',
      },
      black: {
        DEFAULT: '#080817', // added so bare `bg-black`/`text-black` still resolves (see file header note)
        body: '#F2F3F4', 100: '#FFFFFF', 200: '#E6E6EA', 300: '#BCBCC0',
        400: '#7E7E82', 500: '#2E2E30', 600: '#212129', 700: '#171722',
        800: '#0E0E1B', 900: '#080817',
      },

      dark: {
        input: '#232A37',
        input2: '#232A37',
        'input-disabled': '#2C2E32', upload: '#DFE2E5', 'upload-icon': '#787878',
        text: '#8A94A6', text2: '#B0B7C3', subtext: '#434D5F', divide: '#2f3746',
        modal: '#3D3C41', detail: '#0A0F18', info: '#9B9B9B',
        100: '#8A8AAB', 200: '#6D6D8A', 300: '#43435C', 400: '#35354B',
        500: '#2C2C3D', 600: '#202034', 700: '#16162B', 800: '#0E0E23', 900: '#2D3E76',
      },

      accent: {
        teal: '#11C7BC',      // was other.1 in both panels (index agreed too)
        paleBlue: '#B5D2FF',  // was other.3 in fs-biz-panel, other.4 in fs-content-panel (index drifted)
        fscourse: '#FF63A8',  // was other.5 in fs-biz-panel; real name from fs-content-panel
        blueViolet: { 50: '#EDE7F6', 500: '#472CDD' },  // Assessment: Open-ended tag
        burntOrange: { 500: '#DB7725' },                 // Assessment: Choice tag
        forestGreen: { 50: '#E8F5E9', 500: '#3B6D11' },  // OJT: Apprenticeship tag
        vividGreen: { 50: '#E5F6EA', 500: '#00B35A' },   // OJT: Orientation tag
      },

      success: {
        DEFAULT: '#0DC180',
        50: '#f2fbf7', 100: '#CCFBED', 200: '#9BF8D1', 300: '#68ECBC', 400: '#41D9A2',
        500: '#0DC180', 600: '#09A576', 700: '#068A5A', 800: '#046F48', 900: '#025C3C',
        allow: '#0CA68A', overview: '#0CC281', status: '#A6F0E3',
      },
      warning: {
        DEFAULT: '#FFC832',
        50: '#fefbf2', 100: '#FFF8D6', 200: '#FFEFAD', 300: '#FFE483', 400: '#FFDA65',
        500: '#FFC832', 600: '#DBA524', 700: '#B78419', 800: '#93650F', 900: '#7A4F09',
      },
      danger: {
        DEFAULT: '#FF3F3F',
        50: '#fef5f5', 100: '#FFD8D8', 200: '#FFB2B2', 300: '#FF8B8B', 400: '#FF6F6F',
        500: '#FF3F3F', 600: '#DB2E2E', 700: '#B71F1F', 800: '#931414', 900: '#7A0C0C',
      },

      info: {
        50: '#F4FBFF', 500: '#3C9FFC', 600: '#3388EC', 700: '#0F8EFF',
      },
    },

    semantic: {
      primary: { DEFAULT: '#842CDD', hover: '#6C1CCD', border: '#7A27D6', selectedBg: '#DBC5F5', foreground: '#ffffff' },
      background: '#ffffff',
      foreground: '#0a0f18',
    },

    themeExtensions: {
      mainBrand: {
        light: {
          50: 'color-mix(in srgb, var(--color-primary-500) 5%, transparent)',
          200: 'color-mix(in srgb, var(--color-primary-500) 20%, transparent)',
          800: 'color-mix(in srgb, var(--color-primary-500) 80%, transparent)',
          1000: 'var(--color-primary-500)',
        },
        dark: {
          50: 'color-mix(in srgb, var(--color-primary-300) 5%, transparent)',
          200: 'color-mix(in srgb, var(--color-primary-300) 20%, transparent)',
          800: 'color-mix(in srgb, var(--color-primary-300) 80%, transparent)',
          1000: 'var(--color-primary-300)',
        },
      },
      secondaryBrand: {
        dark: {
          50: 'color-mix(in srgb, var(--color-deepPink-300) 5%, transparent)',
          200: 'color-mix(in srgb, var(--color-deepPink-300) 20%, transparent)',
          800: 'color-mix(in srgb, var(--color-deepPink-300) 80%, transparent)',
          1000: 'var(--color-deepPink-300)',
        },
        light: {
          50: 'color-mix(in srgb, var(--color-deepPink-500) 5%, transparent)',
          200: 'color-mix(in srgb, var(--color-deepPink-500) 20%, transparent)',
          800: 'color-mix(in srgb, var(--color-deepPink-500) 80%, transparent)',
          1000: 'var(--color-deepPink-500)',
        },
      },
      neutralSolid: (raw) => ({
        50: raw.neutral[50],
        100: raw.neutral[100],
        150: raw.neutral[200],
        500: raw.neutralAnalogous[500],
        700: raw.neutralAnalogous[700],
        800: raw.neutralAnalogous[800],
        850: '#262c38', // hardcoded in source — doesn't map to any existing scale
        900: raw.neutralAnalogous[900],
      }),
      basicBase: {
        dark: {
          25: 'color-mix(in srgb, var(--color-neutral-50) 3%, transparent)',
          50: 'color-mix(in srgb, var(--color-neutral-50) 6%, transparent)',
          100: 'color-mix(in srgb, var(--color-neutral-50) 12%, transparent)',
          500: 'color-mix(in srgb, var(--color-neutral-50) 60%, transparent)',
          700: 'color-mix(in srgb, var(--color-neutral-50) 78%, transparent)',
          1000: 'var(--color-neutral-50)',
        },
        light: {
          25: '#19191905', 50: '#1919190a', 100: '#1919191a',
          500: '#19191973', 700: '#191919a6', 1000: '#191919e6',
        },
      },

      assessment: {
        openEnded: {
          50: 'color-mix(in srgb, var(--color-blueViolet-500) 5%, transparent)',
          200: 'color-mix(in srgb, var(--color-blueViolet-500) 20%, transparent)',
          1000: 'color-mix(in srgb, var(--color-blueViolet-500) 100%, transparent)',
        },
        choice: {
          50: 'color-mix(in srgb, var(--color-burntOrange-500) 5%, transparent)',
          200: 'color-mix(in srgb, var(--color-burntOrange-500) 20%, transparent)',
          1000: 'color-mix(in srgb, var(--color-burntOrange-500) 100%, transparent)',
        },
      },
      ojt: {
        apprenticeship: { 50: 'var(--color-forestGreen-50)', 1000: 'var(--color-forestGreen-500)' },
        orientation: { 50: 'var(--color-vividGreen-50)', 1000: 'var(--color-vividGreen-500)' },
        simulatedTraining: { 50: 'var(--color-blueViolet-50)', 1000: 'var(--color-blueViolet-500)' },
        crossTraining: { 50: 'var(--color-info-50)', 1000: 'var(--color-info-500)' },
      },
    },
  },

  apps: {
    // REVISED — verified against fs-content-panel's real current tailwind config.
    fsContentPanel: {
      rawColors: {
        classroom: '#C4A9FF',
        embledlink: '#FFE088',
        body: '#161c27',
        fsSubCategory: '#FC3287',
        lbody: '#E8EAEC',
        lgreen: '#97C711',
        limeGreen: '#B1D941',    // was other.5
        paleMint: '#D1FFE9',     // was other.7
        slateGray: '#4C525F',    // was other.8
        nearBlack: '#181717',    // was other.9
        terracotta: '#D45454',   // was other.11
        oliveYellow: '#C5C500',  // was other.12
      },
    },
    fsBizPanel: {
      rawColors: {
        classroom: '#C4A9FF',
        classroomOnsite: '#0fa73a4d',
        classroomOnline: '#edb50066',
        tagClassroomOnline: '#3D67FD',
        tagClassroomOnSite: '#ED8F0A',
        learningPath: '#93C4FF',
        information: '#1A74A8',
        body: '#161c27',
        'sub-table': '#05080C',
        ci: { 1: '#0A0F18' },
        embledlink: '#FFE088',
        brightRed: '#FF3C3C',   // was other.2
        deepIndigo: '#2B0BA9',  // was other.4
        lavender: '#977DFF',    // was other.6
      },
    },
    fsAssessmentPanel: {
      rawColors: {
        lightBG: { 100: '#F9F9FE' },
        setting: { 100: '#FCF9FF' },
      },
    },                      // add its panel-specific colors here if any emerge
  },
};