export const CompModels = {
  Hourly: 'Hourly',
  Daily: 'Daily',
  Salary: 'Straight Salary without bonus',
  SalaryWithBonus: 'Straight Salary with bonus',
  ProductionWithBase: 'Production with Guaranteed Base Salary',
  Production: 'Production with Annual Draw',
  TieredProduction: 'Tiered Production with Annual Draw',
  TieredProductionWithBase: 'Tiered Production with Guaranteed Base Salary'
} as const

export const LicenseRenewals = {
  License: 'License',
  DEA: 'DEA Permit',
  COVD: 'COVD'
} as const

export const AgreementTypes = {
  EmploymentAgreement: 'Employment Agreement',
  OfferLetter: 'Offer Letter',
  Amendment: 'Amendment'
} as const

export const AgreementStatus = {
  AssemblingData: 'Assembling Data',
  DraftRequested: 'Draft Requested',
  Drafting: 'Drafting',
  LegalApproved: 'Legal Approved',
  Executed: 'Executed',
  Terminated: 'Terminated'
} as const