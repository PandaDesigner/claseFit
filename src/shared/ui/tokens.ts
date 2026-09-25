export const designTokens = {
  color: {
    background: '#F7F8FA',
    textPrimary: '#191B1D',
    textSecondary: '#51565C',
    actionPrimary: '#191B1D',
    actionDisabled: '#9AA0A6',
    cardSurface: '#FFFFFF',
    categoryFunctional: '#C6EBEE',
    categoryYoga: '#E5DBF5',
    categoryRumba: '#F5EDAE',
    categorySpinning: '#D8F3E5',
    destructiveText: '#8C1D24',
    destructiveSurface: '#FCE7EA',
    successText: '#1F5C2C',
    successSurface: '#DCEFE0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    control: 12,
    card: 24,
  },
} as const;

export type DesignTokens = typeof designTokens;
