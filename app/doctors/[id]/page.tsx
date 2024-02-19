import Agreement from '@/database/models/agreement'
import Doctor from '@/database/models/doctor'
import { redirect } from 'next/navigation'
import DoctorsDisplay from './display'
import Practice from '@/database/models/practice'
import Entity from '@/database/models/entity'


export default async function DoctorsPage({ params }: { params: { id: string } }){
  let doc = await Doctor.findById(params.id)
  let agreements = await Agreement.find({ doctor: params.id })
  let practices = await Practice.find()
  let entities = await Entity.find().sort({state: 1})

  if(!doc) redirect('/')

  return (
    <DoctorsDisplay
      doctor={JSON.parse(JSON.stringify(doc))}
      agreements={JSON.parse(JSON.stringify(agreements))}
      practices={JSON.parse(JSON.stringify(practices))}
      entities={JSON.parse(JSON.stringify(entities))}
    />
  )
}
