export const MEASUREMENT_CONSTANTS = {
  card: {
    paddingX: 40, // 20px padding * 2
    paddingY: 40, // 20px padding * 2
    titleHeaderHeight: 24, // CardHeader / Title height
    titleHeaderGap: 8,
    borderWidth: 4, // 2px border * 2
  },
  typography: {
    title: {
      fontSize: 26, // (18 + 8) or (18 + 4)
      lineHeight: 1.25,
      charWidthFactor: 0.58,
    },
    body: {
      fontSize: 18,
      lineHeight: 1.5,
      charWidthFactor: 0.52,
    },
    code: {
      fontSize: 16,
      lineHeight: 1.6,
      charWidthFactor: 0.60,
      headerHeight: 37,
      lineNumbersPaddingX: 30, // line number gutter
      paddingY: 28, // 14px * 2
    },
    list: {
      fontSize: 18,
      lineHeight: 1.4,
      charWidthFactor: 0.52,
      bulletWidth: 32, // Checkbox or bullet icon + gap
      itemGap: 10,
    },
    sticky: {
      fontSize: 22,
      lineHeight: 1.4,
      charWidthFactor: 0.55,
      paddingX: 40,
      paddingY: 40,
    },
  },
  minHeights: {
    definition: 150,
    concept: 160,
    code: 160,
    summary: 150,
    interview: 140,
    warning: 140,
    memory: 140,
    note: 140,
    related: 140,
  },
  softMaxHeights: {
    text: 500,
    list: 550,
    code: 750,
  },
  safetyMarginY: 16,
}
