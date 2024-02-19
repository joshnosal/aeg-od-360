'use client'

import { IAgreement } from '@/database/models/agreement'
import { IEntity } from '@/database/models/entity'
import { IPractice } from '@/database/models/practice'
import { Button, Checkbox, Collapse, CollapseProps, DatePicker, Divider, Form, FormInstance, FormItemProps, Input, InputNumber, Select, Space, message } from 'antd'
import React from 'react'
import { AgreementTypes, CompModels } from '@/utils/options'
import { IDoctor } from '@/database/models/doctor'
import { CheckOutlined, QuestionOutlined, SyncOutlined, ExclamationOutlined } from '@ant-design/icons'

export type AgreementFormData = IAgreement & {
  location1PracticeName?: string
  location1PracticeStreet1?: string
  location1PracticeStreet2?: string
  location1PracticeCity?: string
  location1PracticeState?: string
  location1PracticeZip?: string
  location1PracticeSECDName?: string
  location2PracticeName?: string
  location2PracticeStreet1?: string
  location2PracticeStreet2?: string
  location2PracticeCity?: string
  location2PracticeState?: string
  location2PracticeZip?: string
  location2PracticeSECDName?: string
  location3PracticeName?: string
  location3PracticeStreet1?: string
  location3PracticeStreet2?: string
  location3PracticeCity?: string
  location3PracticeState?: string
  location3PracticeZip?: string
  location3PracticeSECDName?: string
}

export type ConfirmListProps = {
  confirmed: string[],
  changed: string[],
  unconfirmed: string[],
  required: string[]
}

type Props = {
  form: FormInstance<AgreementFormData>
  originalData?: AgreementFormData
  disabled?: boolean
  entities: IEntity[]
  practices: IPractice[]
  confirm?: boolean
  checkRequired?: boolean
  confirmList?: ConfirmListProps
  updateStatusList?: (l: StatusListProps) => void
  onChange?: () => void
}

type FormField = FormItemProps & {
  field: React.ReactNode
}


export type StatusListProps = {[key in keyof Partial<AgreementFormData>]: 'confirmed'|'unconfirmed'|'changed'|'required'|'not required'}

export const getPracticeFormData = (practices: IPractice[], practiceId: any|undefined, location: 1|2|3) => {
  let obj: {[key: string]: string} = {}
  let i = location
  let found = false
    for(const practice of practices) {
      if(practice._id !== practiceId) continue
      obj["location"+i+"PracticeName"] = practice.name
      obj["location"+i+"PracticeStreet1"] = practice.street1
      obj["location"+i+"PracticeStreet2"] = practice.street2
      obj["location"+i+"PracticeCity"] = practice.city
      obj["location"+i+"PracticeState"] = practice.state
      obj["location"+i+"PracticeZip"] = practice.zip
      obj["location"+i+"PracticeSECDName"] = practice.SECDName
      found = true
    }
    if(!found) {
      obj["location"+i+"PracticeName"] = ''
      obj["location"+i+"PracticeStreet1"] = ''
      obj["location"+i+"PracticeStreet2"] = ''
      obj["location"+i+"PracticeCity"] = ''
      obj["location"+i+"PracticeState"] = ''
      obj["location"+i+"PracticeZip"] = ''
      obj["location"+i+"PracticeSECDName"] = ''
    }
  return obj as Partial<AgreementFormData>
}

export const missingCSVData = (agreement: IAgreement, practices: IPractice[], entities: IEntity[]): string[] => {
  const list: string[] = []
  const push = (s: string) => list.push(s)

  const getPractice = (id: string|undefined): IPractice|void => {
    for(const practice of practices) {
      if(id === practice._id) return practice
    }
  }

  if(!agreement.firstName) push('OD first name')
  if(!agreement.lastName) push('OD last name')
  if(!agreement.emailPersonal) push('OD personal email')
  if(!agreement.personalStreet1 || !agreement.personalCity || !agreement.personalState || !agreement.personalZip) push('OD home address')
  if(!agreement.employer) push('Employer')
  if(!agreement.effectiveDate) push('Effective date')
  if(!agreement.type) push('Agreement type')
  if(!agreement.compensationModel) push('Compensation model')
  if(agreement.compensationModel === 'Daily') {
    if(!agreement.dailyRate) push('Daily rate')
  } else if(agreement.compensationModel === 'Hourly') {
    if(!agreement.hourlyRate) push('Hourly rate')
  } else if(agreement.compensationModel === 'Production with Annual Draw') {
    if(!agreement.productionPercentage) push('Production percentage')
    if(!agreement.draw) push('Annual draw')
  } else if(agreement.compensationModel === 'Production with Guaranteed Base Salary') {
    if(!agreement.productionPercentage) push('Production percentage')
    if(!agreement.salary) push('Salary')
  } else if(agreement.compensationModel === 'Straight Salary with bonus') {
    if(!agreement.salary) push('Salary')
    if(!agreement.growthBonusPercentage) push('Growth bonus percentage')
  } else if (agreement.compensationModel === 'Straight Salary without bonus') {
    if(!agreement.salary) push('Salary')
  } else if (agreement.compensationModel === 'Tiered Production with Annual Draw' || agreement.compensationModel === 'Tiered Production with Guaranteed Base Salary') {
    if(agreement.compensationModel === 'Tiered Production with Annual Draw'){
      if(!agreement.draw) push('Annual draw')
    } else {
      if(!agreement.salary) push('Salary')
    }
    if(!agreement.numberOfTiers) {
      push('Production tiers')
    } else if(agreement.numberOfTiers < 2) {
      push('Must have atlest two tiers')
    } else if (agreement.numberOfTiers === 2) {
      if(!agreement.tier1Percentage) push('1st tier production percentage')
      if(!agreement.tier1Threshold) push('1st tier threshold')
      if(!agreement.tier2Percentage) push('2nd tier production percentage')
    } else if (agreement.numberOfTiers === 3) {
      if(!agreement.tier1Percentage) push('1st tier production percentage')
      if(!agreement.tier1Threshold) push('1st tier threshold')
      if(!agreement.tier2Percentage) push('2nd tier production percentage')
      if(!agreement.tier2Threshold) push('2st tier threshold')
      if(!agreement.tier3Percentage) push('3rd tier production percentage')
    }
  }
  if(!agreement.earlyTermDamages) push('Early termination damages')
  if(!agreement.term) push('Term')
  if(!agreement.termUnits) push('Term units')
  if(!agreement.renewalTerm) push('Renewal term')
  if(!agreement.renewalTermUnits) push('Renewal term units')
  if(!agreement.termNoticePeriod) push('Termination notice period')
  if(agreement.locationsNumber < 1) {
    push('Location information')
  } else {
    if(agreement.locationsNumber >= 1) {
      let location1 = getPractice(agreement.location1Practice)
      if(!location1 ||
        !location1.name ||
        !location1.street1 ||
        !location1.city ||
        !location1.state ||
        !location1.zip ||
        !location1.SECDName) push('Primary location address')
    }
    if(agreement.locationsNumber >= 2) {
      let location2 = getPractice(agreement.location2Practice)
      if(!location2 ||
        !location2.name ||
        !location2.street1 ||
        !location2.city ||
        !location2.state ||
        !location2.zip ||
        !location2.SECDName) push('Secondary location address')
    }
    if(agreement.locationsNumber >= 3) {
      let location3 = getPractice(agreement.location3Practice)
      if(!location3 ||
        !location3.name ||
        !location3.street1 ||
        !location3.city ||
        !location3.state ||
        !location3.zip ||
        !location3.SECDName) push('Tertiary location address')
    }
  }
  if(!agreement.workSchedule) push('Work schedule')
  if(!agreement.noncompeteTerm) push('Non-compete term')
  if(!agreement.noncompeteRadius) push('Non-compete radius')
  if(!agreement.nonsolicitTerm) push('Non-solicit term')
  if(getEntityState(entities, agreement.employer) === 'Illinois' && !agreement.restrictiveCovenantConsideration) push('Restrictive covenant consideration')

  return list
}

export const getEntityState = (entities: IEntity[], id: string|undefined): string | void => {
  for(const entity of entities) {
    if(entity._id !== id) continue
    return entity.state
  }
  return
}


const buildStatusList = (agr: AgreementFormData, entities: IEntity[]): StatusListProps => {
  let visibleKeys: StatusListProps = {
    lastName: 'unconfirmed',
    firstName: 'unconfirmed',
    emailPersonal: 'unconfirmed',
    personalStreet1: 'unconfirmed',
    personalStreet2: 'unconfirmed',
    personalCity: 'unconfirmed',
    personalState: 'unconfirmed',
    personalZip: 'unconfirmed',
    employer: 'unconfirmed',
    newAcquisition: 'unconfirmed',
    seller: 'not required',
    effectiveDate: 'unconfirmed',
    type: 'unconfirmed',
    compensationModel: 'unconfirmed',
    dailyRate: 'not required',
    hourlyRate: 'not required',
    salary: 'not required',
    draw: 'not required',
    productionPercentage: 'not required',
    growthBonusPercentage: 'not required',
    numberOfTiers: 'not required',
    tier1Percentage: 'not required',
    tier1Threshold: 'not required',
    tier2Percentage: 'not required',
    tier2Threshold: 'not required',
    tier3Percentage: 'not required',
    earlyTermDamages: 'unconfirmed',
    term: 'unconfirmed',
    termUnits: 'unconfirmed',
    renewalTerm: 'unconfirmed',
    renewalTermUnits: 'unconfirmed',
    termNoticePeriod: 'unconfirmed',
    locationsNumber: 'unconfirmed',
    location1Practice: 'not required',
    location1PracticeName: 'not required',
    location1PracticeStreet1: 'not required',
    location1PracticeStreet2: 'not required',
    location1PracticeCity: 'not required',
    location1PracticeState: 'not required',
    location1PracticeZip: 'not required',
    location1PracticeSECDName: 'not required',
    location2Practice: 'not required',
    location2PracticeName: 'not required',
    location2PracticeStreet1: 'not required',
    location2PracticeStreet2: 'not required',
    location2PracticeCity: 'not required',
    location2PracticeState: 'not required',
    location2PracticeZip: 'not required',
    location2PracticeSECDName: 'not required',
    location3Practice: 'not required',
    location3PracticeName: 'not required',
    location3PracticeStreet1: 'not required',
    location3PracticeStreet2: 'not required',
    location3PracticeCity: 'not required',
    location3PracticeState: 'not required',
    location3PracticeZip: 'not required',
    location3PracticeSECDName: 'not required',
    workSchedule: 'unconfirmed',
    fullTime: 'unconfirmed',
    vacationDays: 'unconfirmed',
    ceDays: 'unconfirmed',
    ceReimbursementLimit: 'unconfirmed',
    reimbursementCOVD: 'unconfirmed',
    reimbursementDEA: 'unconfirmed',
    reimbursementLicense: 'unconfirmed',
    notes: 'unconfirmed',
    noncompeteTerm: 'unconfirmed',
    noncompeteRadius: 'unconfirmed',
    nonsolicitTerm: 'unconfirmed',
    restrictiveCovenantConsideration: 'not required',
  }
  if(agr.newAcquisition) visibleKeys.seller = 'unconfirmed'
  if(agr.compensationModel === 'Daily') {
    visibleKeys.dailyRate = 'unconfirmed'
  } else if (agr.compensationModel === 'Hourly') {
    visibleKeys.hourlyRate = 'unconfirmed'
  } else if (agr.compensationModel === 'Production with Annual Draw') {
    visibleKeys.productionPercentage = 'unconfirmed'
    visibleKeys.draw = 'unconfirmed'
  } else if (agr.compensationModel === 'Production with Guaranteed Base Salary') {
    visibleKeys.salary = 'unconfirmed'
    visibleKeys.productionPercentage = 'unconfirmed'
  } else if (agr.compensationModel === 'Straight Salary with bonus') {
    visibleKeys.salary = 'unconfirmed'
    visibleKeys.growthBonusPercentage = 'unconfirmed'
  } else if (agr.compensationModel === 'Straight Salary without bonus') {
    visibleKeys.salary = 'unconfirmed'
  } else if (agr.compensationModel === 'Tiered Production with Annual Draw') {
    visibleKeys.draw = 'unconfirmed'
    visibleKeys.numberOfTiers = 'unconfirmed'
    visibleKeys.tier1Percentage = 'unconfirmed'
    visibleKeys.tier1Threshold = 'unconfirmed'
    visibleKeys.tier2Percentage = 'unconfirmed'
    if(agr.numberOfTiers === 3) {
      visibleKeys.tier2Threshold = 'unconfirmed'
      visibleKeys.tier3Percentage = 'unconfirmed'
    }
  } else if (agr.compensationModel === 'Tiered Production with Guaranteed Base Salary') {
    visibleKeys.salary = 'unconfirmed'
    visibleKeys.numberOfTiers = 'unconfirmed'
    visibleKeys.tier1Percentage = 'unconfirmed'
    visibleKeys.tier1Threshold = 'unconfirmed'
    visibleKeys.tier2Percentage = 'unconfirmed'
    if(agr.numberOfTiers === 3) {
      visibleKeys.tier2Threshold = 'unconfirmed'
      visibleKeys.tier3Percentage = 'unconfirmed'
    }
  }
  if(agr.locationsNumber >= 1) {
    if(agr.location1Practice) visibleKeys.location1Practice = 'unconfirmed'
    visibleKeys.location1PracticeName = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location1PracticeStreet1 = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location1PracticeStreet2 = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location1PracticeCity = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location1PracticeState = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location1PracticeZip = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location1PracticeSECDName = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
  }
  if(agr.locationsNumber >= 2) {
    if(agr.location2Practice) visibleKeys.location2Practice = 'unconfirmed'
    visibleKeys.location2PracticeName = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location2PracticeStreet1 = visibleKeys.location2Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location2PracticeStreet2 = visibleKeys.location2Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location2PracticeCity = visibleKeys.location2Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location2PracticeState = visibleKeys.location2Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location2PracticeZip = visibleKeys.location2Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location2PracticeSECDName = visibleKeys.location2Practice ? 'confirmed' : 'unconfirmed'
  }
  if(agr.locationsNumber >= 3) {
    if(agr.location3Practice) visibleKeys.location3Practice = 'unconfirmed'
    visibleKeys.location3PracticeName = visibleKeys.location1Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location3PracticeStreet1 = visibleKeys.location3Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location3PracticeStreet2 = visibleKeys.location3Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location3PracticeCity = visibleKeys.location3Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location3PracticeState = visibleKeys.location3Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location3PracticeZip = visibleKeys.location3Practice ? 'confirmed' : 'unconfirmed'
    visibleKeys.location3PracticeSECDName = visibleKeys.location3Practice ? 'confirmed' : 'unconfirmed'
  }
  if(getEntityState(entities, agr.employer) === 'Illinois') visibleKeys.restrictiveCovenantConsideration = 'unconfirmed'

  let keys = Object.keys(visibleKeys) as (keyof StatusListProps)[]
  let reqNumbers: (keyof StatusListProps)[] = [
    'hourlyRate', 
    'dailyRate', 
    'salary', 
    'draw', 
    'growthBonusPercentage', 
    'productionPercentage', 
    'numberOfTiers',
    'tier1Percentage',
    'tier1Threshold',
    'tier2Percentage',
    'tier2Threshold',
    'tier3Percentage',
    'earlyTermDamages',
    'restrictiveCovenantConsideration'
  ]
  let reqBools: (keyof StatusListProps)[] = [
    'seller',
    'newAcquisition',
    'fullTime',
    'reimbursementCOVD',
    'reimbursementDEA',
    'reimbursementLicense',
  ]
  let permittedZeros: (keyof StatusListProps)[] = [
    'vacationDays',
    'ceDays',
    'ceReimbursementLimit'
  ]
  for(const key of keys) {
    if(visibleKeys[key] === 'not required') continue
    if(reqNumbers.includes(key)) {
      if(!agr[key] || Number(agr[key]) == 0) visibleKeys[key] = 'required'
    } else if (permittedZeros.includes(key)) {
      if(agr[key] === undefined) visibleKeys[key] = 'required'
    } else if (!reqBools.includes(key) && key !== 'notes' && key !== 'personalStreet2') {
      if(!agr[key]) visibleKeys[key] = 'required'
    }
  }
  return visibleKeys
}

export default function AgreementForm(props: Props){
  Form.useWatch('newAcquisition', props.form)
  Form.useWatch('compensationModel', props.form)
  Form.useWatch('numberOfTiers', props.form)
  Form.useWatch('locationsNumber', props.form)
  Form.useWatch('employer', props.form)
  const [ statusList, setStatusList ] = React.useState<StatusListProps>()

  // Initilize status list
  React.useEffect(() => {
    if(!props.originalData) return
    setStatusList(buildStatusList(props.originalData, props.entities))
  }, [props.originalData, props.entities])

  // Pass status list to parent
  React.useEffect(() => {
    if(!statusList || !props.updateStatusList) return
    props.updateStatusList(statusList)
  }, [statusList, props])

  const onValueChange = (c: any, v: AgreementFormData) => {
    let key = Object.keys(c)[0] as keyof AgreementFormData

    if(key === 'newAcquisition') {

      if(v.newAcquisition === false) {
        props.form.setFieldValue('seller', false)
        setStatusList({...statusList, [key]: 'changed', seller: 'not required'})
      } else {
        setStatusList({...statusList, [key]: 'changed', seller: 'unconfirmed'})
      }
      
    } else if (key === 'compensationModel') {

      let valAug: Partial<AgreementFormData> = {
        hourlyRate: undefined,
        dailyRate: undefined,
        salary: undefined,
        draw: undefined,
        growthBonusPercentage: undefined,
        productionPercentage: undefined,
        numberOfTiers: undefined,
        tier1Percentage: undefined,
        tier1Threshold: undefined,
        tier2Percentage: undefined,
        tier2Threshold: undefined,
        tier3Percentage: undefined
      }
      let statusAug: Partial<StatusListProps> = {
        hourlyRate: 'not required',
        dailyRate: 'not required',
        draw: 'not required',
        salary: 'not required',
        productionPercentage: 'not required',
        growthBonusPercentage: 'not required',
        numberOfTiers: 'not required',
        tier1Percentage: 'not required',
        tier1Threshold: 'not required',
        tier2Percentage: 'not required',
        tier2Threshold: 'not required',
        tier3Percentage: 'not required'
      }
      if(v.compensationModel === 'Daily') {
        valAug.dailyRate = 0
        statusAug.dailyRate = 'required'
      } else if (v.compensationModel === 'Hourly') {
        valAug.hourlyRate = 0
        statusAug.hourlyRate = 'required'
      } else if (v.compensationModel === 'Production with Annual Draw') {
        valAug.productionPercentage = 0
        valAug.draw = 0
        statusAug.productionPercentage = 'required'
        statusAug.draw = 'required'
      } else if (v.compensationModel === 'Production with Guaranteed Base Salary') {
        valAug.productionPercentage = 0
        valAug.salary = 0
        statusAug.productionPercentage = 'required'
        statusAug.salary = 'required'
      } else if (v.compensationModel === 'Straight Salary with bonus') {
        valAug.growthBonusPercentage = 0
        valAug.salary = 0
        statusAug.growthBonusPercentage = 'required'
        statusAug.salary = 'required'
      } else if (v.compensationModel === 'Straight Salary without bonus') {
        valAug.salary = 0
        statusAug.salary = 'required'
      } else if (v.compensationModel === 'Tiered Production with Annual Draw') {
        valAug.draw = 0
        valAug.numberOfTiers = 2
        valAug.tier1Percentage = 0
        valAug.tier1Threshold = 0
        valAug.tier2Percentage = 0
        statusAug.draw = 'required'
        statusAug.numberOfTiers = 'unconfirmed'
        statusAug.tier1Percentage = 'required'
        statusAug.tier1Threshold = 'required'
        statusAug.tier2Percentage = 'required'
        if( v.numberOfTiers === 3) {
          valAug.tier2Threshold = 0
          valAug.tier3Percentage = 0
          statusAug.tier2Threshold = 'required'
          statusAug.tier3Percentage = 'required'
        }
      } else if (v.compensationModel === 'Tiered Production with Guaranteed Base Salary') {
        valAug.salary = 0
        valAug.numberOfTiers = 2
        valAug.tier1Percentage = 0
        valAug.tier1Threshold = 0
        valAug.tier2Percentage = 0
        statusAug.salary = 'required'
        statusAug.numberOfTiers = 'unconfirmed'
        statusAug.tier1Percentage = 'required'
        statusAug.tier1Threshold = 'required'
        statusAug.tier2Percentage = 'required'
        if( v.numberOfTiers === 3) {
          valAug.tier2Threshold = 0
          valAug.tier3Percentage = 0
          statusAug.tier2Threshold = 'required'
          statusAug.tier3Percentage = 'required'
        }
      }
      setStatusList({ ...statusList, [key]: 'changed', ...statusAug})
      props.form.setFieldsValue(valAug)

    } else if (key === 'numberOfTiers') {

      if(v.numberOfTiers === 2) {
        props.form.setFieldsValue({tier3Percentage: undefined, tier2Threshold: undefined})
        setStatusList({ ...statusList, [key]: 'changed', tier3Percentage: 'not required', tier2Threshold: 'not required' })
      } else {
        props.form.setFieldsValue({tier3Percentage: 0, tier2Threshold: 0})
        setStatusList({ ...statusList, [key]: 'changed', tier3Percentage: 'required', tier2Threshold: 'required'})
      }

    } else if (key === 'locationsNumber') {
      
      let valAug: Partial<AgreementFormData> = {
        location2Practice: v.location2Practice || '',
        location2PracticeName: v.location2PracticeName || '',
        location2PracticeStreet1: v.location2PracticeStreet1 || '',
        location2PracticeStreet2: v.location2PracticeStreet2 || '',
        location2PracticeCity: v.location2PracticeCity || '',
        location2PracticeState: v.location2PracticeState || '',
        location2PracticeZip: v.location2PracticeZip || '',
        location2PracticeSECDName: v.location2PracticeSECDName || '',
        location3Practice: v.location3Practice || '',
        location3PracticeName: v.location3PracticeName || '',
        location3PracticeStreet1: v.location3PracticeStreet1 || '',
        location3PracticeStreet2: v.location3PracticeStreet2 || '',
        location3PracticeCity: v.location3PracticeCity || '',
        location3PracticeState: v.location3PracticeState || '',
        location3PracticeZip: v.location3PracticeZip || '',
        location3PracticeSECDName: v.location3PracticeSECDName || '',
      }
      let statusAug: Partial<StatusListProps> = {
        location2Practice: statusList?.location2Practice || 'required',
        location2PracticeName: statusList?.location2Practice || 'required',
        location2PracticeStreet1: statusList?.location2Practice || 'required',
        location2PracticeStreet2: statusList?.location2Practice || 'required',
        location2PracticeCity: statusList?.location2Practice || 'required',
        location2PracticeState: statusList?.location2Practice || 'required',
        location2PracticeZip: statusList?.location2Practice || 'required',
        location2PracticeSECDName: statusList?.location2Practice || 'required',
        location3Practice: statusList?.location2Practice || 'required',
        location3PracticeName: statusList?.location2Practice || 'required',
        location3PracticeStreet1: statusList?.location2Practice || 'required',
        location3PracticeStreet2: statusList?.location2Practice || 'required',
        location3PracticeCity: statusList?.location2Practice || 'required',
        location3PracticeState: statusList?.location2Practice || 'required',
        location3PracticeZip: statusList?.location2Practice || 'required',
        location3PracticeSECDName: statusList?.location2Practice || 'required',
      }
      if(v.locationsNumber < 2) {
        valAug.location2Practice = undefined
        valAug.location2PracticeName = undefined
        valAug.location2PracticeStreet1 = undefined
        valAug.location2PracticeStreet2 = undefined
        valAug.location2PracticeCity = undefined
        valAug.location2PracticeState = undefined
        valAug.location2PracticeZip = undefined
        valAug.location2PracticeSECDName = undefined
        statusAug.location2Practice = 'not required'
        statusAug.location2PracticeName = 'not required'
        statusAug.location2PracticeStreet1 = 'not required'
        statusAug.location2PracticeStreet2 = 'not required'
        statusAug.location2PracticeCity = 'not required'
        statusAug.location2PracticeState = 'not required'
        statusAug.location2PracticeZip = 'not required'
        statusAug.location2PracticeSECDName = 'not required'
      }
      if(v.locationsNumber < 3) {
        valAug.location3Practice = undefined
        valAug.location3PracticeName = undefined
        valAug.location3PracticeStreet1 = undefined
        valAug.location3PracticeStreet2 = undefined
        valAug.location3PracticeCity = undefined
        valAug.location3PracticeState = undefined
        valAug.location3PracticeZip = undefined
        valAug.location3PracticeSECDName = undefined
        statusAug.location3Practice = 'not required'
        statusAug.location3PracticeName = 'not required'
        statusAug.location3PracticeStreet1 = 'not required'
        statusAug.location3PracticeStreet2 = 'not required'
        statusAug.location3PracticeCity = 'not required'
        statusAug.location3PracticeState = 'not required'
        statusAug.location3PracticeZip = 'not required'
        statusAug.location3PracticeSECDName = 'not required'
      }
      props.form.setFieldsValue(valAug)
      setStatusList({...statusList, [key]: 'changed', ...statusAug})

    } else if (key === 'location1Practice') {

      if(v.location1Practice) {
        props.form.setFieldsValue(getPracticeFormData(props.practices, v.location1Practice, 1))
        setStatusList({...statusList, [key]: 'changed', 
          location1PracticeName: 'confirmed',
          location1PracticeStreet1: 'confirmed',
          location1PracticeStreet2: 'confirmed',
          location1PracticeCity: 'confirmed',
          location1PracticeState: 'confirmed',
          location1PracticeZip: 'confirmed',
          location1PracticeSECDName: 'confirmed'
        })
      } else {
        console.log(getPracticeFormData(props.practices, '', 1))
        props.form.setFieldsValue(getPracticeFormData(props.practices, '', 1))
        setStatusList({...statusList, [key]: 'changed', 
          location1PracticeName: 'required',
          location1PracticeStreet1: 'required',
          location1PracticeStreet2: 'required',
          location1PracticeCity: 'required',
          location1PracticeState: 'required',
          location1PracticeZip: 'required',
          location1PracticeSECDName: 'required'
        })
      }

    } else if (key === 'location2Practice') {

      if(v.location2Practice) {
        props.form.setFieldsValue(getPracticeFormData(props.practices, v.location2Practice, 2))
        setStatusList({...statusList, [key]: 'changed', 
          location2PracticeName: 'confirmed',
          location2PracticeStreet1: 'confirmed',
          location2PracticeStreet2: 'confirmed',
          location2PracticeCity: 'confirmed',
          location2PracticeState: 'confirmed',
          location2PracticeZip: 'confirmed',
          location2PracticeSECDName: 'confirmed'
        })
      } else {
        props.form.setFieldsValue(getPracticeFormData(props.practices, '', 2))
        setStatusList({...statusList, [key]: 'changed', 
          location2PracticeName: 'required',
          location2PracticeStreet1: 'required',
          location2PracticeStreet2: 'required',
          location2PracticeCity: 'required',
          location2PracticeState: 'required',
          location2PracticeZip: 'required',
          location2PracticeSECDName: 'required'
        })
      }

    } else if (key === 'location3Practice') {

      if(v.location3Practice) {
        props.form.setFieldsValue(getPracticeFormData(props.practices, v.location3Practice, 3))
        setStatusList({...statusList, [key]: 'changed', 
          location3PracticeName: 'confirmed',
          location3PracticeStreet1: 'confirmed',
          location3PracticeStreet2: 'confirmed',
          location3PracticeCity: 'confirmed',
          location3PracticeState: 'confirmed',
          location3PracticeZip: 'confirmed',
          location3PracticeSECDName: 'confirmed'
        })
      } else {
        props.form.setFieldsValue(getPracticeFormData(props.practices, '', 3))
        setStatusList({...statusList, [key]: 'changed', 
          location3PracticeName: 'required',
          location3PracticeStreet1: 'required',
          location3PracticeStreet2: 'required',
          location3PracticeCity: 'required',
          location3PracticeState: 'required',
          location3PracticeZip: 'required',
          location3PracticeSECDName: 'required'
        })
      }

    } else if (key === 'employer') {

      let state = getEntityState(props.entities, v.employer)
      if(state === 'Illinois' && statusList?.restrictiveCovenantConsideration === 'not required') {
        props.form.setFieldValue('restrictiveCovenantConsideration', 0)
        setStatusList({ ...statusList, [key]: 'changed', restrictiveCovenantConsideration: 'required' })
      } else if (state !== 'Illinois') {
        props.form.setFieldValue('restrictiveCovenantConsideration', undefined)
        setStatusList({ ...statusList, [key]: 'changed', restrictiveCovenantConsideration: 'not required' })
      }

    } else if (key === 'fullTime') {
      if(v.fullTime === true) {
        props.form.setFieldsValue({
          vacationDays: 10,
          ceDays: 3,
          ceReimbursementLimit: 1500,
          reimbursementLicense: true,
          reimbursementDEA: false,
          reimbursementCOVD: false,
        })
        setStatusList({...statusList, [key]: 'changed', 
          vacationDays: 'changed',
          ceDays: 'changed',
          ceReimbursementLimit: 'changed',
          reimbursementLicense: 'changed',
          reimbursementDEA: 'changed',
          reimbursementCOVD: 'changed',
        })
      } else {
        props.form.setFieldsValue({
          vacationDays: 0,
          ceDays: 0,
          ceReimbursementLimit: 0,
          reimbursementLicense: false,
          reimbursementDEA: false,
          reimbursementCOVD: false,
        })
        setStatusList({...statusList, [key]: 'changed', 
          vacationDays: 'changed',
          ceDays: 'changed',
          ceReimbursementLimit: 'changed',
          reimbursementLicense: 'changed',
          reimbursementDEA: 'changed',
          reimbursementCOVD: 'changed',
        })
      }
    } else {

      let reqNumbers: (keyof StatusListProps)[] = [
        'hourlyRate', 
        'dailyRate', 
        'salary', 
        'draw', 
        'growthBonusPercentage', 
        'productionPercentage', 
        'numberOfTiers',
        'tier1Percentage',
        'tier1Threshold',
        'tier2Percentage',
        'tier2Threshold',
        'tier3Percentage',
        'earlyTermDamages',
        'restrictiveCovenantConsideration'
      ]
      let reqBools: (keyof StatusListProps)[] = [
        'seller',
        'newAcquisition',
        'reimbursementCOVD',
        'reimbursementDEA',
        'reimbursementLicense'
      ]
      if(reqNumbers.includes(key)) {
        if(!v[key] || Number(v[key]) == 0) setStatusList({...statusList, [key]: 'required'})
        else setStatusList({...statusList, [key]: 'changed'})
      } else if (reqBools.includes(key) || key === 'notes') {
        setStatusList({...statusList, [key]: 'changed'})
      } else {
        setStatusList({...statusList, [key]: !v[key] ? 'required' : 'changed'})
      }

    }
  }

  const handleConfirm = (f: keyof AgreementFormData) => {
    setStatusList({...statusList, [f]: 'confirmed'})
  }

  type InputProps =
    | { type: 'divider', label: string, orientationMargin?: "0" }
    | { type: 'input', field: React.ReactNode, name: keyof AgreementFormData} & Pick<FormItemProps, 'label'|'hidden'|'rules'|'valuePropName'|'getValueFromEvent'|'initialValue'>

  let items: InputProps[] = [
    { type: 'divider', label: 'General', orientationMargin: '0' },
    { 
      type: 'input', 
      label: 'Agreement Type', 
      name: 'type', 
      field: (
        <Select
          options={Object.values(AgreementTypes).map(type => ({ value: type, label: type, disabled: type === 'Amendment' ? true : false }))}
          disabled={Boolean(props.form.getFieldValue('type') === 'Amendment' || props.disabled)}
          popupMatchSelectWidth={false}
        />
      ) 
    },
    {
      type: 'input',
      label: 'Effective Date',
      name: 'effectiveDate',
      rules: [{ required: true }],
      field: <DatePicker/>
    },
    {
      type: 'input', label: 'Employer', name: 'employer',
      field: <Select options={props.entities.map(entity => ({ value: entity._id, label: `${entity.state} - ${entity.name}`}))} popupMatchSelectWidth={false} style={{maxWidth: 225, minWidth: 225}}/>
    },
    {
      type: 'input', label: 'New Acquisition', name: 'newAcquisition', valuePropName: 'checked',
      field: <Checkbox/>
    },
    {
      type: 'input', label: 'Selling Doctor', name: 'seller', valuePropName: 'checked',
      hidden: props.form.getFieldValue('newAcquisition') === false,
      field: <Checkbox/>
    },
    { type: 'divider', label: 'Optometrist', orientationMargin: '0' },
    { type: 'input', label: 'First Name', name: 'firstName', field: <Input/>},
    { type: 'input', label: 'Last Name', name: 'lastName', field: <Input/>},
    { type: 'input', label: 'Personal Email', name: 'emailPersonal', field: <Input/>},
    { type: 'input', label: 'Street 1', name: 'personalStreet1', field: <Input/>},
    { type: 'input', label: 'Street 2', name: 'personalStreet2', field: <Input/>},
    { type: 'input', label: 'City', name: 'personalCity', field: <Input/>},
    { type: 'input', label: 'State', name: 'personalState', field: <Input/>},
    { type: 'input', label: 'Zip', name: 'personalZip', field: <Input/>},
    { type: 'divider', label: 'Compensation', orientationMargin: '0' },
    { 
      type: 'input', label: 'Comp. Model', name: 'compensationModel',
      field: <Select options={Object.values(CompModels).map(type => ({ value: type, label: type }))} popupMatchSelectWidth={false} style={{ maxWidth: 225, minWidth: 225}} /> 
    },
    { 
      type: 'input', label: 'Hourly Rate ($)', name: 'hourlyRate', rules: [{type: 'number', min: 0 }],
      hidden: props.form.getFieldValue('compensationModel') !== 'Hourly',
      field: <InputNumber/>
    },
    { 
      type: 'input', label: 'Daily Rate ($)', name: 'dailyRate', rules: [{type: 'number', min: 0 }],
      hidden: props.form.getFieldValue('compensationModel') !== 'Daily',
      field: <InputNumber/>
    },
    { 
      type: 'input', label: 'Salary ($)', name: 'salary', rules: [{type: 'number', min: 0 }],
      hidden: ![CompModels.ProductionWithBase, CompModels.Salary, CompModels.SalaryWithBonus, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')),
      field: <InputNumber/>
    },
    { 
      type: 'input', label: 'Annual Draw ($)', name: 'draw', rules: [{type: 'number', min: 0 }],
      hidden: ![CompModels.Production, CompModels.TieredProduction].includes(props.form.getFieldValue('compensationModel')),
      field: <InputNumber/>
    },
    { 
      type: 'input', label: 'Production (%)', name: 'productionPercentage', rules: [{type: 'number', min: 0, max: 100 }],
      hidden: ![CompModels.Production, CompModels.ProductionWithBase].includes(props.form.getFieldValue('compensationModel')),
      field: <InputNumber/>
    },
    { 
      type: 'input', label: 'Growth Bonus (%)', name: 'growthBonusPercentage', rules: [{type: 'number', min: 0, max: 100 }],
      hidden: props.form.getFieldValue('compensationModel') !== CompModels.SalaryWithBonus,
      field: <InputNumber/>
    },
    { 
      type: 'input', label: 'No. of Tiers', name: 'numberOfTiers',
      hidden: ![CompModels.TieredProduction, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')),
      field: <Select options={[{ value: 2, label: 2}, {value: 3, label: 3}]} popupMatchSelectWidth={false}/>
    },
    {
      type: 'input', label: 'Tier 1 Production (%)', name: 'tier1Percentage',
      hidden: ![CompModels.TieredProduction, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')),
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Tier 1 Threshold ($)', name: 'tier1Threshold',
      hidden: ![CompModels.TieredProduction, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')),
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Tier 2 Production (%)', name: 'tier2Percentage',
      hidden: ![CompModels.TieredProduction, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')),
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Tier 2 Threshold ($)', name: 'tier2Threshold', rules: [{type: 'number', min: props.form.getFieldValue('tier1Threshold')}],
      hidden: ![CompModels.TieredProduction, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')) || props.form.getFieldValue('numberOfTiers') !== 3,
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Tier 3 Production (%)', name: 'tier3Percentage',
      hidden: ![CompModels.TieredProduction, CompModels.TieredProductionWithBase].includes(props.form.getFieldValue('compensationModel')) || props.form.getFieldValue('numberOfTiers') !== 3,
      field: <InputNumber/>
    },
    { type: 'divider', label: 'Term', orientationMargin: '0' },
    {
      type: 'input', label: 'Initial Term', name: 'term', rules: [{type: 'number', min: 1 }],
      field: <InputNumber/>
    }, 
    {
      type: 'input', label: 'Initial Term Units', name: 'termUnits',
      field: <Select options={[{value: 'Years', label: 'Years' }, {value: 'Months', label: 'Months'}]} popupMatchSelectWidth={false}/>
    },
    {
      type: 'input', label: 'Renewal Term', name: 'renewalTerm', rules: [{type: 'number', min: 1 }],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Renewal Term Units', name: 'renewalTermUnits',
      field: <Select options={[{value: 'Years', label: 'Years' }, {value: 'Months', label: 'Months'}]} popupMatchSelectWidth={false}/>
    },
    {
      type: 'input', label: 'Term. Notice Period', name: 'termNoticePeriod', getValueFromEvent: e => Math.round(e || 90), rules: [{type: 'number', min: 60 }],
      field: <InputNumber step={30}/>
    },
    {
      type: 'input', label: 'Early Term. Damages (per day)', name: 'earlyTermDamages', rules: [{ type: 'number', min: 50}],
      field: <InputNumber/>
    },
    { type: 'divider', label: 'Locations', orientationMargin: '0' },
    {
      type: 'input', label: '# of Locations', name: 'locationsNumber',
      field: <Select options={[{ value: 1, label: 1}, { value: 2, label: 2}, {value: 3, label: 3}]} popupMatchSelectWidth={false}/>
    },
    { type: 'divider', label: 'Location #1' },
    {
      type: 'input', label: 'Practice ID', name: 'location1Practice',
      field: (
        <Select
          options={[
            { value: '', label: 'New' },
            ...props.practices.map(practice => ({ value: practice._id, label: `${practice.id || 'NEW'} - ${practice.name}`}))
          ]}
          popupMatchSelectWidth={false}
          style={{ width: 225 }}
        />
      )
    },
    {
      type: 'input', label: 'Name', name: 'location1PracticeName',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Street 1', name: 'location1PracticeStreet1',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Street 2', name: 'location1PracticeStreet2',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'City', name: 'location1PracticeCity',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'State', name: 'location1PracticeState',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Zip', name: 'location1PracticeZip',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'SECD Name', name: 'location1PracticeSECDName',
      field: <Input disabled={Boolean(props.form.getFieldValue('location1Practice') || props.disabled)}/>
    },
    { type: 'divider', label: 'Location #2' },
    {
      type: 'input', label: 'Practice ID', name: 'location2Practice',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: (
        <Select
          options={[
            { value: '', label: 'New' },
            ...props.practices.map(practice => ({ value: practice._id, label: `${practice.id || 'NEW'} - ${practice.name}`}))
          ]}
          popupMatchSelectWidth={false}
          style={{ width: 225 }}
        />
      )
    },
    {
      type: 'input', label: 'Name', name: 'location2PracticeName',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Street 1', name: 'location2PracticeStreet1',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Street 2', name: 'location2PracticeStreet2',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'City', name: 'location2PracticeCity',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'State', name: 'location2PracticeState',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Zip', name: 'location2PracticeZip',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'SECD Name', name: 'location2PracticeSECDName',
      hidden: props.form.getFieldValue('locationsNumber') < 2,
      field: <Input disabled={Boolean(props.form.getFieldValue('location2Practice') || props.disabled)}/>
    },
    { type: 'divider', label: 'Location #3' },
    {
      type: 'input', label: 'Practice ID', name: 'location3Practice',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: (
        <Select
          options={[
            { value: '', label: 'New' },
            ...props.practices.map(practice => ({ value: practice._id, label: `${practice.id || 'NEW'} - ${practice.name}`}))
          ]}
          popupMatchSelectWidth={false}
          style={{ width: 225 }}
        />
      )
    },
    {
      type: 'input', label: 'Name', name: 'location3PracticeName',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Street 1', name: 'location3PracticeStreet1',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Street 2', name: 'location3PracticeStreet2',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'City', name: 'location3PracticeCity',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'State', name: 'location3PracticeState',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'Zip', name: 'location3PracticeZip',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    {
      type: 'input', label: 'SECD Name', name: 'location3PracticeSECDName',
      hidden: props.form.getFieldValue('locationsNumber') < 3,
      field: <Input disabled={Boolean(props.form.getFieldValue('location3Practice') || props.disabled)}/>
    },
    { type: 'divider', label: 'Schedule', orientationMargin: '0' },
    {
      type: 'input', label: 'Work Schedule', name: 'workSchedule',
      field: <Input.TextArea style={{ minHeight: 80, width: 225 }}/>
    },
    { type: 'divider', label: 'Benefits', orientationMargin: '0' },
    {
      type: 'input', label: 'Full Time?', name: 'fullTime', valuePropName: 'checked',
      field: <Checkbox>{props.form.getFieldValue('fullTime') === true ? "Yes" : "No"}</Checkbox>
    },
    {
      type: 'input', label: 'Vacation Days', name: 'vacationDays', getValueFromEvent: v => Math.round(v), rules: [{type: 'number', min: 0}],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'CE Days', name: 'ceDays', getValueFromEvent: v => Math.round(v), rules: [{type: 'number', min: 0}],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'CE Reimbursement Limit ($)', name: 'ceReimbursementLimit', getValueFromEvent: v => Math.round(v), rules: [{type: 'number', min: 0}],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Reimburse OD License', name: 'reimbursementLicense', valuePropName: 'checked',
      field: <Checkbox/>
    },
    {
      type: 'input', label: 'Reimburse DEA Permit', name: 'reimbursementDEA', valuePropName: 'checked',
      field: <Checkbox/>
    },
    {
      type: 'input', label: 'Reimburse COVD Certificate', name: 'reimbursementCOVD', valuePropName: 'checked',
      field: <Checkbox/>
    },
    {
      type: 'input', label: 'Notes', name: 'notes',
      field: <Input.TextArea style={{ minHeight: 80, width: 225 }}/>
    },
    { type: 'divider', label: 'Restrictive Covenants', orientationMargin: '0' },
    {
      type: 'input', label: 'Non-compete Term (months)', name: 'noncompeteTerm', rules: [{ type: 'number', min: 0}],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Non-compete Radius (miles)', name: 'noncompeteRadius', rules: [{ type: 'number', min: 0}],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Non-solicit Term (months)', name: 'nonsolicitTerm', rules: [{ type: 'number', min: 0}],
      field: <InputNumber/>
    },
    {
      type: 'input', label: 'Restrictive Covenant Consideration ($)', name: 'restrictiveCovenantConsideration', rules: [{ type: 'number', min: 0}],
      hidden: getEntityState(props.entities, props.form.getFieldValue('employer')) !== 'Illinois',
      field: <InputNumber/>
    }

  ]

  return (
    <Form
      form={props.form}
      size='small'
      onValuesChange={onValueChange}
      labelCol={{ span: props.confirm ? 8 : 10 }}
      wrapperCol={{ span: 24 }}
      disabled={props.disabled}
      labelWrap
    >
      {items.map(item => {
        if(item.type === 'divider') {
          return <Divider orientation='left' orientationMargin={item.orientationMargin} plain={!item.orientationMargin} key={`divider-${item.label}`}>{item.label}</Divider>
        }

        let status = statusList ? statusList[item.name] : undefined
        return (
          <Form.Item label={item.label} hidden={item.hidden} key={`divider-${item.name}`}>
            <Space className='overflow-hidden flex justify-between flex-nowrap items-center'>
              <Form.Item name={item.name} rules={item.rules} valuePropName={item.valuePropName} getValueFromEvent={item.getValueFromEvent} initialValue={item.initialValue} noStyle>
                {item.field}
              </Form.Item>
              {props.confirm && statusList ? (
                <Button 
                  size='small'
                  icon={ status === 'confirmed' ? <CheckOutlined/> : status === 'unconfirmed' ? <QuestionOutlined/> : status === 'required' ? <ExclamationOutlined/> : <SyncOutlined/> }
                  onClick={() => status === 'unconfirmed' ? handleConfirm(item.name) : null}
                  style={{
                    borderColor: status === 'confirmed' ? 'green' : status === 'changed' ? 'gold' : status === 'unconfirmed' ? 'gray' : 'red',
                    color: status === 'confirmed' ? 'green' : status === 'changed' ? 'gold' : status === 'unconfirmed' ? 'gray' : 'red',
                    fontSize: '12px'
                  }}
                >
                  {status === 'confirmed' ? 'Confirmed' : status === 'unconfirmed' ? 'Check' : status === 'required' ? 'Required' : 'Changed'}
                </Button>
              ) : props.checkRequired && statusList && status === 'required' ? (
                <Button 
                  size='small'
                  icon={ <ExclamationOutlined/> }
                  style={{
                    borderColor: 'red',
                    color: 'red',
                    fontSize: '12px'
                  }}
                >
                  {'Required'}
                </Button>
              ) : null }
            </Space>
          </Form.Item>
        )
      })}
    </Form>
  )
}
