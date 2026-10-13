/**
 * Illustrative ROI model. Minutes per triggered action, manual vs automated.
 * Saved minutes per action (≈ 6.73) × the latest run's 165 actions ≈ 18.5 h — the Overview KPI.
 */
export const EFFORT_PER_ACTION = [
  { stage: 'Identify inactivity', manual: 1.5, automated: 0.05 },
  { stage: 'Profile & segment', manual: 1.5, automated: 0.05 },
  { stage: 'Personalise copy', manual: 3.0, automated: 0.8 },
  { stage: 'Dispatch', manual: 1.2, automated: 0.2 },
  { stage: 'Track & report', manual: 0.8, automated: 0.17 },
];

export const ROI_ASSUMPTIONS = {
  defaultHourlyCost: 45,
  workingDaysPerMonth: 22,
  workingDaysPerYear: 260,
};
