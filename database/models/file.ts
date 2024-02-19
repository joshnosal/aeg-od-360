import { CompModels } from '@/utils/options'
import { Model, Schema, model, models, Types } from 'mongoose'
import Entity from './entity'

export interface IFile {
  _id: string
  fileName: string
  fileData: string,
  agreement: string
}

export interface DbFile extends Omit<IFile, 'agreement'> {
  agreement: Types.ObjectId
}

const fileSchema = new Schema<DbFile, Model<DbFile>>({
  fileName: { type: String, required: true },
  fileData: { type: String, required: true },
  agreement: {type: Schema.Types.ObjectId, ref: 'Agreement'},
}, {strict: true, timestamps: true })

const File: Model<DbFile> = models && models.File ? models.File : model('File', fileSchema, 'files')

export default File