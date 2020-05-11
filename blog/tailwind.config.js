module.exports = {
  purge: ["./**/*.html", "./**/*.vue", "./**/*.jsx", "./**/*.tsx"],
  theme: {
    /*The plugin is tailwindcss-plugins */
    gradients: theme => ({
      "purple-blue": [theme("colors.purple.500"), theme("colors.blue.500")],
      "primary-info": ['to right', theme("colors.primary.color-primary-300"), theme("colors.info.color-info-300")],
      // Array definition (defaults to linear gradients).
      'topaz':      ['30deg', theme('colors.orange.500'), theme('colors.pink.400')],
      'topaz-dark': ['30deg', theme('colors.orange.700'), theme('colors.pink.600')],
      'emerald':    ['to right', theme('colors.green.400'), theme('colors.teal.500')],
      'fireopal':   ['to right', '#40E0D0', '#FF8C00', '#FF0080'],
      'relay':      ['to top left', '#3A1C71', '#D76D77', '#FFAF7B'],
      // Object definition.
      'mono-circle': {
          type: 'radial',
          colors: ['circle', '#CCC', '#000']
      },
    }),
    /*The plugin is tailwindcss-gradients */
    linearGradientColors: (theme) => theme("colors"),
    radialGradientColors: (theme) => theme("colors"),
    conicGradientColors: (theme) => theme("colors"),
    
    // fontFamily: {
    //   display: "var(--font-display)",
    //   body: "var(--font-body)",
    // },
    // fontWeights: {
    //   normal: "var(--font-weight-normal)",
    //   display: "var(--font-weight-display)",
    //   btn: "var(--font-weight-btn)",
    // },
    // borderRadius: {
    //   none: "0",
    //   btn: "var(--rounded-btn)",
    // },
    extend: {
      colors: {
        "accent-1": "#FAFAFA",
        "accent-2": "#EAEAEA",
        "accent-7": "#333",
        success: "#0070f3",
        cyan: "#79FFE1",
        primary: {
          1: "var(--color-bg-primary)",
          /*The plugin is tailwindcss-gradients */
          2: ["var(--color-bg-primary)", "var(--color-bg-secondary)"],
          3: [
            "var(--color-bg-primary)",
            "var(--color-bg-secondary)",
            "var(--color-bg-primary)",
          ],
        },
        secondary: {
          1: "var(--color-bg-secondary)",
        },
        default: {
          1: "var(--color-bg-default)",
        },
        "default-soft": { 
          1: "var(--color-text-default-soft)",
        },
        inverse: {
          1: "var(--color-bg-inverse)",
        },
        "inverse-soft": { 
          1: "var(--color-text-inverse-soft)",
        },
      },
      spacing: {
        28: "7rem",
      },
      letterSpacing: {
        tighter: "-.04em",
      },
      lineHeight: {
        tight: 1.2,
      },
      fontSize: {
        "5xl": "2.5rem",
        "6xl": "2.75rem",
        "7xl": "4.5rem",
        "8xl": "6.25rem",
      },
      boxShadow: {
        small: "0 5px 10px rgba(0, 0, 0, 0.12)",
        medium: "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      borderWidth: {
        "1": "1px",
        "0": "0",
        "2": "2px",
        "4": "4px",
      },
    },
  },
  variants: {
    gradients: ["responsive", "hover", 'active', 'focus-within'],
    backgroundColor: ['responsive', 'hover', 'focus', 'focus-within', 'group-focus'],
    textColor: ['responsive', 'hover', 'focus', 'group-focus'],
  },
  plugins: [
    // require('tailwindcss-transforms'),
    // require('tailwindcss-transitions'),
    // require('tailwindcss-border-gradients'),
    require("tailwindcss-gradients"),
    require("tailwindcss-plugins/gradients"),
  ],
};
