export const FEATURE_FLAGS = {
  smtpHtml: {
    defaultEnabled: false,
  },
  smtpLog: {
    defaultEnabled: false,
  },
  passwordRegistration: {
    defaultEnabled: true,
  },
  passwordLogin: {
    defaultEnabled: true,
  },
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAG_KEYS = Object.keys(
  FEATURE_FLAGS
) as FeatureFlagKey[];
