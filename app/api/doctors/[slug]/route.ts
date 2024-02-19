import connectMongoose from '@/database/connection'
import Doctor, { DbDoctor, IDoctor } from '@/database/models/doctor'
import { sendErrorToClient } from '@/utils/error_handler'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const createNew = async (v: Partial<IDoctor>): Promise<DbDoctor> => {
  let doc = await new Doctor(v).save()
  return doc
}

export const GET = async () => {

}

export const POST = async (
  req: NextRequest,
  { params }: { params: {slug: string }}
) => {
  try {
    await connectMongoose()
    let data = await req.json()
    let slug = params.slug

    if(slug === 'new') {
      return NextResponse.json(await createNew(data))
    }
    return NextResponse.json({})
  } catch(e) {
    return sendErrorToClient(e)
  }
  
}