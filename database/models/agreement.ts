import { Model, Schema, model, models, Types, Document } from 'mongoose'
import { AgreementStatus, AgreementTypes, CompModels } from '@/utils/options'

export interface IAgreement {
  _id: string
  status: typeof AgreementStatus[keyof typeof AgreementStatus]
  doctor: string
  firstName: string
  lastName: string
  emailPersonal: string
  personalStreet1: string
  personalStreet2: string
  personalCity: string
  personalState: string
  personalZip: string
  employer: string
  newAcquisition: boolean
  seller: boolean
  effectiveDate: string
  type: typeof AgreementTypes[keyof typeof AgreementTypes]
  originalAgreement: string
  compensationModel:  typeof CompModels[keyof typeof CompModels]
  hourlyRate: number|null
  dailyRate: number|null
  salary: number|null
  draw: number|null
  growthBonusPercentage: number|null
  productionPercentage: number|null
  numberOfTiers: number|null
  tier1Percentage: number|null
  tier1Threshold: number|null
  tier2Percentage: number|null
  tier2Threshold: number|null
  tier3Percentage: number|null
  earlyTermDamages: number|null
  termUnits: 'Years'|'Months'
  term: number
  renewalTerm: number
  renewalTermUnits: 'Years'|'Months'
  termNoticePeriod: number
  locationsNumber: number
  location1Practice?: string
  location2Practice?: string
  location3Practice?: string
  workSchedule: string
  fullTime: boolean
  vacationDays: number
  ceDays: number
  ceReimbursementLimit: number
  reimbursementLicense: boolean
  reimbursementDEA: boolean
  reimbursementCOVD: boolean
  notes: string
  noncompeteTerm: number
  noncompeteRadius: number
  nonsolicitTerm: number
  restrictiveCovenantConsideration: number|null
  updatedAt: string
  file?: string
  draftRequested?: string
  legalApproved?: string
  terminated?: string
  csvDownload?: string
}

export interface AgreementDocument extends Omit<IAgreement, 
  |'_id'
  |'file'
  |'employer'
  |'effectiveDate'
  |'doctor'
  |'employer'
  |'originalAgreement'
  |'location1Practice'
  |'location2Practice'
  |'location3Practice'
  |'draftRequested'
  |'legalApproved'
  |'terminated'
  |'csvDownload'
> {
  _id: Types.ObjectId
  doctor: Types.ObjectId
  employer: Types.ObjectId
  effectiveDate: Date
  originalAgreement?: Types.ObjectId
  location1Practice?: Types.ObjectId
  location2Practice?: Types.ObjectId 
  location3Practice?: Types.ObjectId
  file?: Types.ObjectId
  draftRequested?: Date
  legalApproved?: Date
  terminated?: Date
  csvDownload?: Date
}

const agreementSchema = new Schema<AgreementDocument, Model<AgreementDocument>>({
  status: { type: String, required: true, default: 'Assembling Data'},
  doctor: {type: Schema.Types.ObjectId, ref: 'Doctor', required: true},
  lastName: String,
  firstName: String,
  emailPersonal: String,
  personalStreet1: String,
  personalStreet2: String,
  personalCity: String,
  personalState: String,
  personalZip: String,
  employer: { type: Schema.Types.ObjectId, ref: 'Entity'},
  newAcquisition: {type: Boolean, required: true, default: false},
  seller: {type: Boolean, required: true, default: false},
  effectiveDate: {type: Date, required: true},
  type: {type: String, required: true, default: 'Employment Agreement'},
  originalAgreement: {type: Schema.Types.ObjectId, ref: 'Agreement'},
  compensationModel:  {type: String, required: true, default: 'Straight Salary without bonus'},
  hourlyRate: Number,
  dailyRate: Number,
  salary: Number,
  draw: Number,
  growthBonusPercentage: Number,
  productionPercentage: Number,
  numberOfTiers: Number,
  tier1Percentage: Number,
  tier1Threshold: Number,
  tier2Percentage: Number,
  tier2Threshold: Number,
  tier3Percentage: Number,
  earlyTermDamages: Number,
  termUnits: {type: String, required: true, default: 'Years'},
  term: {type: Number, required: true, default: 3},
  renewalTerm: {type: Number, required: true, default: 3},
  renewalTermUnits: {type: String, required: true, default: 'Years'},
  termNoticePeriod: {type: Number, required: true, default: 90},
  locationsNumber: {type: Number, required: true, default: 1},
  location1Practice: {type: String},
  location2Practice: {type: String},
  location3Practice: {type: String},
  workSchedule: {type: String},
  fullTime: Boolean,
  vacationDays: {type: Number, required: true, default: 0},
  ceDays: {type: Number, required: true, default: 0},
  ceReimbursementLimit: {type: Number, required: true, default: 0},
  reimbursementLicense: {type: Boolean, required: true, default: false},
  reimbursementDEA: {type: Boolean, required: true, default: false},
  reimbursementCOVD: {type: Boolean, required: true, default: false},
  notes: String,
  noncompeteTerm: {type: Number, required: true, default: 24},
  noncompeteRadius: {type: Number, required: true, default: 10},
  nonsolicitTerm: {type: Number, required: true, default: 24},
  restrictiveCovenantConsideration: {type: Number, required: true, default: 0},
  file: {type: Schema.Types.ObjectId, ref: 'File'},
  draftRequested: Date,
  legalApproved: Date,
  terminated: Date,
  csvDownload: Date
}, {strict: true, timestamps: true })

const Agreement: Model<AgreementDocument> = models && models.Agreement ? models.Agreement : model('Agreement', agreementSchema, 'agreements')

export default Agreement