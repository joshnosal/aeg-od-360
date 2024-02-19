import { CompModels } from '@/utils/options'
import { Model, Schema, model, models, Types } from 'mongoose'
import Entity from './entity'

export interface IDoctor {
  _id: string
  firstName: string
  lastName: string
  emailPersonal: string
  emailBusiness: string
  personalStreet1: string
  personalStreet2: string
  personalCity: string
  personalState: string
  personalZip: string
  employer: string
  favorite_movie: string
  updatedAt: string
}

export interface DbDoctor extends Omit<IDoctor, 'employer'|'updatedAt'> {
  employer: Types.ObjectId
  updatedAt: Date
}

const doctorSchema = new Schema<DbDoctor, Model<DbDoctor>>({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  emailPersonal: { type: String, required: true },
  emailBusiness: String,
  personalStreet1: String,
  personalStreet2: String,
  personalCity: String,
  personalState: String,
  personalZip: String,
  employer: {type: Schema.Types.ObjectId, ref: 'Entity'},
  favorite_movie: {type: String, default: 'Godzilla'}
}, {strict: true, timestamps: true })

const Doctor: Model<DbDoctor> = models && models.Doctor ? models.Doctor : model('Doctor', doctorSchema, 'doctors')

export default Doctor
