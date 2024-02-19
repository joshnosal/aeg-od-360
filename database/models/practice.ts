import { Model, Schema, model, models, Types, Document } from 'mongoose'

export interface IPractice {
  _id: string
  id: string
  name: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  SECDName: string
  RVPName: string
  DMName: string
  updatedAt: string
}


const practiceSchema = new Schema<IPractice, Model<IPractice>>({
  id: String,
  name: {type: String, required: true},
  street1: {type: String, required: true},
  street2: {type: String},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zip: {type: String, required: true},
  SECDName: {type: String, required: true},
  RVPName: {type: String},
  DMName: {type: String},
}, {strict: true, timestamps: true })

const Practice: Model<IPractice> = models && models.Practice ? models.Practice : model('Practice', practiceSchema, 'practices')

export default Practice
