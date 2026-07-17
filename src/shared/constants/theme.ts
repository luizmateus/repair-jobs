export const colors = {
  background: '#F4F7F5',
  surface: '#FFFFFF',
  border: '#D5DED8',
  text: '#14201A',
  textMuted: '#5C6B63',
  primary: '#1F6F5B',
  primaryPressed: '#175647',
  danger: '#A33B2B',
  open: '#2F6FED',
  claimed: '#C47A12',
  done: '#5C6B63',
  overlay: 'rgba(20, 32, 26, 0.04)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadows = {
  sm: {
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: colors.text,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    color: colors.text,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
};
