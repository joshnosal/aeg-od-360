
import Agreement, { AgreementDocument, IAgreement } from '@/database/models/agreement'
import { sendErrorToClient } from '@/utils/error_handler'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Practice, { IPractice } from '@/database/models/practice'
import Doctor, { DbDoctor, IDoctor } from '@/database/models/doctor'
import Entity from '@/database/models/entity'
import { HydratedDocument } from 'mongoose'
import AgreementFile from '@/database/models/file'
import { AgreementFormData } from '@/app/doctors/[id]/form_agreement'
import connectMongoose from '@/database/connection'


const createAgreement = async (doctorId: string, agreementType: string|null) => {
  let now = new Date()

  let doctor = await Doctor.findById(doctorId)
  if(!doctor) throw new Error('Missing doctor')

  const addDocDetails = (agr: HydratedDocument<AgreementDocument>, doc: DbDoctor ): HydratedDocument<AgreementDocument> => {
    agr.firstName = doc.firstName
    agr.lastName = doc.lastName
    agr.emailPersonal = doc.emailPersonal
    agr.personalCity = doc.personalCity
    agr.personalState = doc.personalState
    agr.personalStreet1 = doc.personalStreet1
    agr.personalStreet2 = doc.personalStreet2
    agr.personalZip = doc.personalZip
    return agr
  }

  if(agreementType === 'Amendment') {

    let oldAgr = await Agreement.find({$and: [
      {doctor: doctorId},
      {status: 'Executed'},
      {type: 'Employment Agreement'}
    ]}).sort({effectiveDate: -1}).limit(1)

    let latestAgr = (await Agreement.find({$and: [
      {doctor: doctorId},
      {status: 'Executed'},
    ]}).sort({effectiveDate: -1}).limit(1))[0]

    latestAgr._id = new mongoose.Types.ObjectId()
    latestAgr.isNew = true
    latestAgr.effectiveDate = new Date(now.getFullYear(), now.getMonth()+1, now.getDate())
    latestAgr.originalAgreement = oldAgr[0]._id
    latestAgr.type = agreementType
    latestAgr.status = 'Assembling Data'
    latestAgr.csvDownload = undefined
    latestAgr.file = undefined
    latestAgr = addDocDetails(latestAgr, doctor)
    return await latestAgr.save()

  } else {

    let newAgr = new Agreement({
      doctor: doctorId,
      employer: doctor?.employer,
      effectiveDate: new Date(now.getFullYear(), now.getMonth()+1, now.getDate()),
    })
    newAgr = addDocDetails(newAgr, doctor)
    console.log(newAgr)
    return await newAgr.save()
  }
}

const updateAgreement = async (data: AgreementFormData, updateType?: 'master'|string) => {
  if(!data.location1Practice && data.location1PracticeName) {
    let location1Practice = await new Practice({
      name: data.location1PracticeName,
      street1: data.location1PracticeStreet1,
      street2: data.location1PracticeStreet2,
      city: data.location1PracticeCity,
      state: data.location1PracticeState,
      zip: data.location1PracticeZip,
      SECDName: data.location1PracticeSECDName
    }).save()
    data.location1Practice = location1Practice._id
  }
  if(!data.location2Practice && data.location2PracticeName) {
    let location2Practice = await new Practice({
      name: data.location2PracticeName,
      street1: data.location2PracticeStreet1,
      street2: data.location2PracticeStreet2,
      city: data.location2PracticeCity,
      state: data.location2PracticeState,
      zip: data.location2PracticeZip,
      SECDName: data.location2PracticeSECDName
    }).save()
    data.location2Practice = location2Practice._id
  }
  if(!data.location3Practice && data.location3PracticeName) {
    let location3Practice = await new Practice({
      name: data.location3PracticeName,
      street1: data.location3PracticeStreet1,
      street2: data.location3PracticeStreet2,
      city: data.location3PracticeCity,
      state: data.location3PracticeState,
      zip: data.location3PracticeZip,
      SECDName: data.location3PracticeSECDName
    }).save()
    data.location3Practice = location3Practice._id
  }

  let unset: Partial<AgreementFormData> = {}

  if(updateType !== 'master') {
    data.status = 'Assembling Data'
    unset.csvDownload = ''
    unset.draftRequested = ''
    unset.legalApproved = ''
  }

  await Agreement.findOneAndUpdate({_id: data._id}, {...data, $unset: unset}, {})

}

const getCSVData = async (agreementId: string) => {
  let agreement = await Agreement.findById(agreementId)
  if(!agreement) throw new Error('Missing agreement')

  let doctor = await Doctor.findById(agreement.doctor)
  if(!doctor) throw new Error('Missing doctor')

  let employer = await Entity.findById(agreement.employer)
  if(!employer) throw new Error('Missing employer')

  let practice1 = await Practice.findById(agreement.location1Practice)
  if(!practice1) throw new Error('Missing practice')

  let practice2 = await Practice.findById(agreement.location2Practice)
  let practice3 = await Practice.findById(agreement.location3Practice)

  let original
  if(agreement.type === 'Amendment') {
    original = await Agreement.findById(agreement.originalAgreement)
    if(!original) throw new Error('Missing original agreement')
  }

  const convertDate = (string: Date) => {
    let date = new Date(string)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const getLicenseRenewal = (agr: AgreementDocument): string => {
    let list = []
    if(agr.reimbursementLicense) list.push('Optometry License')
    if(agr.reimbursementCOVD) list.push('COVD Certificate')
    if(agr.reimbursementDEA) list.push('DEA Permit')
    if(list.length === 1) {
      return list[0]
    } else if (list.length === 2) {
      return list.join(' and ')
    } else if (list.length === 3) {
      return list[0] + "," + list[1] + ', and' + list[2]
    } else {
      return 'Not Eligible'
    }
  }

  const getDateString = (string: Date) => {
    let date = new Date(string)
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  let data = {
    seller: agreement.seller ? 'Yes' : 'No',
    newAcquisition: agreement.newAcquisition ? 'Yes' : 'No',
    employerState: employer.state || '',
    newAgrType: agreement.type || '',
    newAgrEffectiveDate: convertDate(agreement.effectiveDate),
    originalType: original ? original.type : '',
    originalEffectiveDate: original ? convertDate(original.effectiveDate) : '',
    SECD: practice1.SECDName,
    hrbp: '',
    hrbpEmail: '',
    ODLastName: doctor.lastName || '',
    ODFirstName: doctor.firstName || '',
    ODEmail: doctor.emailPersonal || '',
    ODStreet: doctor.personalStreet1 + (doctor.personalStreet2 ? ', ' + doctor.personalStreet2 : ''),
    ODCity: doctor.personalCity || '',
    ODState: doctor.personalState || '',
    ODZip: doctor.personalZip || '',
    compModel: agreement.compensationModel || '',
    hourlyRate: agreement.hourlyRate || '',
    dailyRate: agreement.dailyRate || '',
    salary: agreement.salary || '',
    draw: agreement.draw || '',
    growthBonus: agreement.growthBonusPercentage || '',
    production: agreement.productionPercentage || '',
    numTiers: agreement.numberOfTiers || '',
    tier1Percentage: agreement.tier1Percentage,
    tier1Threshold: agreement.tier1Threshold,
    tier2Percentge: agreement.tier2Percentage,
    tier2Threshold: agreement.tier2Threshold,
    tier3Percentage: agreement.tier3Percentage,
    earlyTermDamages: agreement.earlyTermDamages,
    term: agreement.term,
    termUnits: agreement.termUnits,
    renewalTerm: agreement.renewalTerm,
    renewalTermUnits: agreement.renewalTermUnits,
    termNotice: agreement.termNoticePeriod,
    numLocations: agreement.locationsNumber,
    loc1number: practice1.id || 'N/A',
    loc1street: practice1.street1 + (practice1.street2 ? ', ' + practice1.street2 : ''),
    loc1city: practice1.city,
    loc1state: practice1.state,
    loc1zip: practice1.zip,
    ...(practice2 && ({
      loc2number: practice2.id || 'N/A',
      loc2street: practice2.street1 + (practice2.street2 ? ', ' + practice2.street2 : ''),
      loc2city: practice2.city,
      loc2state: practice2.state,
      loc2zip: practice2.zip,
    })),
    ...(practice3 && ({
      loc3number: practice3.id || 'N/A',
      loc3street: practice3.street1 + (practice3.street2 ? ', ' + practice3.street2 : ''),
      loc3city: practice3.city,
      loc3state: practice3.state,
      loc3zip: practice3.zip,
    })),
    workSchedule: agreement.workSchedule,
    satPerMonth: '',
    fullTime: agreement.fullTime ? "Full Time" : "Part Time",
    vacationDays: agreement.vacationDays || 'Not Eligible',
    ceDays: agreement.ceDays || 'Not Eligible',
    ceReimbursement: agreement.ceReimbursementLimit || 'Not Eligible',
    liceneRenewal: getLicenseRenewal(agreement),
    nonCompeteTerm: agreement.noncompeteTerm,
    nonCompeteRadius: agreement.noncompeteRadius,
    nonSolicitTerm: agreement.nonsolicitTerm,
    restrictiveCovenantConsideration: agreement.restrictiveCovenantConsideration,
    notes: agreement.notes || '',
    submittedBy: '',
    created: '',
    // vacationType: agreement.compensationModel === 'Tiered Production with Annual Draw' || agreement.compensationModel === 'Production with Annual Draw' ? 'Sabbatical' : 'PTO',
    // effectiveDateString: getDateString(agreement.effectiveDate),
    // originalEffectiveDateString: original ? getDateString(original.effectiveDate) : '',
    // nonCompeteTerm2: Math.round(agreement.noncompeteTerm * 10 * (2/3)) / 10,
    // nonCompeteTerm3: Math.round(agreement.noncompeteTerm * 10 * (1/3)) / 10,
    // nonCompeteRadius2: Math.round(agreement.noncompeteRadius * 10 * (2/3)) / 10,
    // nonCompeteRadius3: Math.round(agreement.noncompeteRadius * 10 * (1/3)) / 10,
    // nonSolicitTerm2: Math.round(agreement.nonsolicitTerm * 10 * (2/3)) / 10,
    // nonSolicitTerm3: Math.round(agreement.nonsolicitTerm * 10 * (1/3)) / 10,
    // state: employer.state,
    // entityName: employer.name,
    // entityType: employer.type,
    // entitySigntory: employer.signatoryName,
    // entitySigTitle: employer.signatoryTitle
  }

  agreement.status = 'Drafting'
  agreement.csvDownload = new Date()
  await agreement.save()

  return data

}

const uploadFile = async (agreementId: string, fileData: string, fileName: string, uploadType: string) => {
  let file = await new AgreementFile({
    fileName,
    fileData,
    agreement: agreementId
  }).save()
  await Agreement.findOneAndUpdate({_id: agreementId}, {
    file: file._id, 
    status: uploadType === 'signed' ? 'Executed' : 'Legal Approved',
    ...(uploadType === 'draft' && { legalApproved: new Date() })
  })
}

const deleteAgreement = async (agreementId: string) => {
  await Agreement.findOneAndDelete({_id: agreementId})
  await AgreementFile.deleteMany({agreement: agreementId})
}

const getAgreementDetails = async (agreementId: string) => {
  let agreement = await Agreement.findById(agreementId)
  if(!agreement) throw new Error('No agreement found')

  let doctor = await Doctor.findById(agreement.doctor)
  if(!doctor) throw new Error('No doctor found')

  if(agreement.type === 'Amendment') {
    let oldAgreement = await Agreement.findById(agreement.originalAgreement).lean()
    if(!oldAgreement) throw new Error()
    let amendments = await Agreement.find({$and: [
      { originalAgreement: agreement.originalAgreement },
      { status: 'Executed' },
      { type: 'Amendment' }
    ]}).sort({ effectiveDate: -1 }).limit(1).lean()

    let lastAmendment = amendments[0]
    if(lastAmendment) {
      lastAmendment = {
        ...lastAmendment,
        effectiveDate: oldAgreement.effectiveDate,
        type: oldAgreement.type
      }
      oldAgreement = lastAmendment
    }
    return { agreement, doctor, oldAgreement }
  } else {
    return { agreement, doctor }
  }
  
}

const requestDraft = async (agreementId: string) => {
  let agr = await Agreement.findById(agreementId)
  if(!agr) throw new Error()
  agr.status = 'Draft Requested'
  agr.draftRequested = new Date()
  await agr.save()
  return
}

const terminateAgreement = async (agreementId: string) => {
  let agr = await Agreement.findById(agreementId)
  if(!agr) throw new Error()
  agr.status = 'Executed'
  agr.terminated = new Date()
  await agr.save()
  return
}

export const GET = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectMongoose()
    let slug = params.slug
    let headersList = headers()
    if(slug === 'new') {
      let doctorId = headersList.get('doctorId')
      let agreementType = headersList.get('agreementType')
      if(!doctorId) throw new Error('Missing doctor')
      return NextResponse.json(await createAgreement(doctorId, agreementType))
    } else if (slug === 'csv') {
      let agreementId = headersList.get('agreementId')
      if(!agreementId) throw new Error('Missing agreement Id')
      return NextResponse.json(await getCSVData(agreementId))
    } else if (slug === 'delete') {
      let agreementId = headersList.get('agreementId')
      if(!agreementId) throw new Error('Missing agreement Id')
      await deleteAgreement(agreementId)
      return NextResponse.json({})
    } else if (slug === 'details') {
      let agreementId = headersList.get('agreementId')
      if(!agreementId) throw new Error('Missing agreement Id')
      return NextResponse.json(await getAgreementDetails(agreementId))
    } else if (slug === 'request_draft') {
      let agreementId = headersList.get('agreementId')
      if(!agreementId) throw new Error('Missing agreement Id')
      await requestDraft(agreementId)
    } else if (slug === 'terminate') {
      let agreementId = headersList.get('agreementId')
      if(!agreementId) throw new Error('Missing agreement Id')
      await terminateAgreement(agreementId)
    }
    return NextResponse.json({})
  } catch(e) {
    return sendErrorToClient(e)
  }
}

export const POST = async (
  req: NextRequest,
  { params }: { params: {slug: string }}
) => {
  try {
    await connectMongoose()
    
    let slug = params.slug
    let headersList = headers()
    if(slug === 'update') {
      let data = await req.json()
      let updateType = headersList.get('updateType')
      await updateAgreement(data)
      return NextResponse.json({})
    } else if (slug === 'file_upload') {
      let data = await req.json()
      let agreementId = headersList.get('agreementId')
      let fileName = headersList.get('fileName')
      let uploadType = headersList.get('uploadType')

      if(!agreementId || !fileName || !uploadType) throw new Error()
      await updateAgreement(data.updates)
      await uploadFile(agreementId, data.file, fileName, uploadType)
    }
    
    return NextResponse.json({})
  } catch(e) {
    console.log(e)
    return sendErrorToClient(e)
  }
  
}