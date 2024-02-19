import { Model, Schema, model, models, Types, Document } from 'mongoose'

export interface IEntity {
  _id: string
  state: string
  name: string
  type: string
  signatoryName: string
  signatoryTitle: string
  updatedAt: string
}


const entitySchema = new Schema<IEntity, Model<IEntity>>({
  state: {type: String, required: true},
  name: {type: String, required: true},
  type: {type: String, required: true},
  signatoryName: {type: String, required: true},
  signatoryTitle: {type: String, required: true},
}, {strict: true, timestamps: true })

const Entity: Model<IEntity> = models && models.Entity ? models.Entity : model('Entity', entitySchema, 'entities')

export default Entity