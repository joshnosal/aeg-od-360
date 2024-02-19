import Doctor from '@/database/models/doctor'
import { redirect, useRouter } from 'next/navigation'
import DoctorDisplay from './display'
import StyledComponentsRegistry from '@/utils/AntRegistry'
import Agreement from '@/database/models/agreement'
import Practice from '@/database/models/practice'
import Entity from '@/database/models/entity'


export default async function DoctorPage({ params }: { params: {id: string}}){
  let doc = await Doctor.findById(params.id)
  let agreements = await Agreement.find({doctor: params.id})
  let practices = await Practice.find()
  let entities = await Entity.find().sort({state: 1})

  if(!doc) redirect('/')

  return (
    <DoctorDisplay 
      doctor={JSON.parse(JSON.stringify(doc))}
      agreements={JSON.parse(JSON.stringify(agreements))}
      practices={JSON.parse(JSON.stringify(practices))}
      entities={JSON.parse(JSON.stringify(entities))}
    />
  )
}