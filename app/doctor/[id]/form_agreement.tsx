'use client'

import { IAgreement } from '@/database/models/agreement'
import { AgreementTypes, CompModels } from '@/utils/options'
import { Button, Checkbox, Collapse, CollapseProps, Input, Select, Row, Col, DatePicker, InputNumber, Divider, Tooltip, SelectProps } from 'antd'
import React from 'react'
import dayjs from 'dayjs'
import { IPractice } from '@/database/models/practice'
import { IEntity } from '@/database/models/entity'
import { IDoctor } from '@/database/models/doctor'
import { useRouter } from 'next/navigation'
import { AppContext } from '@/utils/AppContext'
import { mkConfig, generateCsv, download } from "export-to-csv";

type Props = {
  agreement: IAgreement
  doctor: IDoctor
  practices: IPractice[]
  entities: IEntity[]
  clear: () => void
}

const Label = ({title}: {title: string}) => (
  <div
    className='text-xs font-semibold text-slate-400 mb-1'
    style={{ opacity: title ? 1 : 0}}
  >
    {title || 'title'}
  </div>
)

const emptyLocation: Partial<IPractice> = {
  name: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  SECDName: ''
}

const getLocation = (practices: IPractice[], id: string|undefined) =>  {
  for(const practice of practices) {
    if(practice._id !== id) continue
    return practice
  }
  return emptyLocation
}

const getEntityState = (entities: IEntity[], id: string|undefined): string | void => {
  for(const entity of entities) {
    if(entity._id !== id) continue
    return entity.state
  }
  return
}

export default function AgreementFormLayout(props: Props){
  const [ agreement, setAgreement ] = React.useState<IAgreement>(props.agreement)
  const [ doctor, setDoctor ] = React.useState<IDoctor>(props.doctor)
  const [location1, setLocation1] = React.useState<Partial<IPractice>>(getLocation(props.practices, props.agreement.location1Practice))
  const [location2, setLocation2] = React.useState<Partial<IPractice>>(getLocation(props.practices, props.agreement.location2Practice))
  const [location3, setLocation3] = React.useState<Partial<IPractice>>(getLocation(props.practices, props.agreement.location3Practice))
  const [ changed, setChanged ] = React.useState<boolean>(false)
  const [ missingList, setMissingList ] = React.useState<string[]>([])
  const [refresh, setRefresh] = React.useState<boolean>(true)
  const [saving, setSaving] = React.useState<boolean>(false)
  const { message } = React.useContext(AppContext)
  const router = useRouter()
  const employerState = getEntityState(props.entities, agreement.employer)

  // Reload state data
  React.useEffect(() => {
    setAgreement(props.agreement)
    setDoctor(props.doctor)
    setLocation1(getLocation(props.practices, props.agreement.location1Practice))
    setLocation2(getLocation(props.practices, props.agreement.location2Practice))
    setLocation3(getLocation(props.practices, props.agreement.location3Practice))
  }, [props.practices, props.agreement, props.doctor, refresh])

  // Check for changes to data
  React.useEffect(() => {
    let keys = Object.keys(agreement) as (keyof IAgreement)[]
    for(const key of keys) {
      if(agreement[key] !== props.agreement[key]) {
        return setChanged(true)
      }
    }

    let docKeys = Object.keys(doctor) as (keyof IDoctor)[]
    for(const key of docKeys) {
      if(doctor[key] !== props.doctor[key]) {
        if(key === 'updatedAt') continue
        return setChanged(true)
      }
    }

    let loc1 = getLocation(props.practices, props.agreement.location1Practice)
    let loc2 = getLocation(props.practices, props.agreement.location2Practice)
    let loc3 = getLocation(props.practices, props.agreement.location3Practice)
    let loc1Keys = Object.keys(loc1) as (keyof Partial<IPractice>)[]
    let loc2Keys = Object.keys(loc2) as (keyof Partial<IPractice>)[]
    let loc3Keys = Object.keys(loc3) as (keyof Partial<IPractice>)[]
    for(const key of loc1Keys) {
      if(location1[key] !== loc1[key]) return setChanged(true)
    }
    for(const key of loc2Keys) {
      if(location2[key] !== loc2[key]) return setChanged(true)
    }
    for(const key of loc3Keys) {
      if(location3[key] !== loc3[key]) return setChanged(true)
    }

    setChanged(false)
  }, [agreement, doctor, props.doctor, props.agreement, location1, location2, location3, props.practices])

  // Check for missing CSV information
  React.useEffect(() => {
    const list: string[] = []
    const push = (s: string) => list.push(s)
    if(!props.doctor.firstName) push('OD first name')
    if(!props.doctor.lastName) push('OD last name')
    if(!props.doctor.emailPersonal) push('OD personal email')
    if(!props.doctor.personalStreet1 || !props.doctor.personalCity || !props.doctor.personalState || !props.doctor.personalZip) push('OD home address')
    if(!props.agreement.employer) push('Employer')
    if(!props.agreement.effectiveDate) push('Effective date')
    if(!props.agreement.type) push('Agreement type')
    if(!props.agreement.compensationModel) push('Compensation model')
    if(props.agreement.compensationModel === 'Daily') {
      if(!props.agreement.dailyRate) push('Daily rate')
    } else if(props.agreement.compensationModel === 'Hourly') {
      if(!props.agreement.hourlyRate) push('Hourly rate')
    } else if(props.agreement.compensationModel === 'Production with Annual Draw') {
      if(!props.agreement.productionPercentage) push('Production percentage')
      if(!props.agreement.draw) push('Annual draw')
    } else if(props.agreement.compensationModel === 'Production with Guaranteed Base Salary') {
      if(!props.agreement.productionPercentage) push('Production percentage')
      if(!props.agreement.salary) push('Salary')
    } else if(props.agreement.compensationModel === 'Straight Salary with bonus') {
      if(!props.agreement.salary) push('Salary')
      if(!props.agreement.growthBonusPercentage) push('Growth bonus percentage')
    } else if (props.agreement.compensationModel === 'Straight Salary without bonus') {
      if(!props.agreement.salary) push('Salary')
    } else if (props.agreement.compensationModel === 'Tiered Production with Annual Draw' || props.agreement.compensationModel === 'Tiered Production with Guaranteed Base Salary') {
      if(props.agreement.compensationModel === 'Tiered Production with Annual Draw'){
        if(!props.agreement.draw) push('Annual draw')
      } else {
        if(!props.agreement.salary) push('Salary')
      }
      if(!props.agreement.numberOfTiers) {
        push('Production tiers')
      } else if(props.agreement.numberOfTiers < 2) {
        push('Must have atlest two tiers')
      } else if (props.agreement.numberOfTiers === 2) {
        if(!props.agreement.tier1Percentage) push('1st tier production percentage')
        if(!props.agreement.tier1Threshold) push('1st tier threshold')
        if(!props.agreement.tier2Percentage) push('2nd tier production percentage')
      } else if (props.agreement.numberOfTiers === 3) {
        if(!props.agreement.tier1Percentage) push('1st tier production percentage')
        if(!props.agreement.tier1Threshold) push('1st tier threshold')
        if(!props.agreement.tier2Percentage) push('2nd tier production percentage')
        if(!props.agreement.tier2Threshold) push('2st tier threshold')
        if(!props.agreement.tier3Percentage) push('3rd tier production percentage')
      }
    }
    if(!props.agreement.earlyTermDamages) push('Early termination damages')
    if(!props.agreement.term) push('Term')
    if(!props.agreement.termUnits) push('Term units')
    if(!props.agreement.renewalTerm) push('Renewal term')
    if(!props.agreement.renewalTermUnits) push('Renewal term units')
    if(!props.agreement.termNoticePeriod) push('Termination notice period')
    if(props.agreement.locationsNumber < 1) {
      push('Location information')
    } else {
      if(props.agreement.locationsNumber >= 1) {
        if(!props.agreement.location1Practice &&
          (!location1.name ||
          !location1.street1 ||
          !location1.city ||
          !location1.state ||
          !location1.zip ||
          !location1.SECDName)) push('Primary location address')
      }
      if(props.agreement.locationsNumber >= 2) {
        if(!props.agreement.location2Practice &&
          (!location2.name ||
          !location2.street1 ||
          !location2.city ||
          !location2.state ||
          !location2.zip ||
          !location2.SECDName)) push('Primary location address')
      }
      if(props.agreement.locationsNumber >= 3) {
        if(!props.agreement.location3Practice &&
          (!location3.name ||
          !location3.street1 ||
          !location3.city ||
          !location3.state ||
          !location3.zip ||
          !location3.SECDName)) push('Primary location address')
      }
    }
    if(!props.agreement.workSchedule) push('Work schedule')
    if(!props.agreement.ftpt) push('Full-Time v Part-Time')
    if(!props.agreement.noncompeteTerm) push('Non-compete term')
    if(!props.agreement.noncompeteRadius) push('Non-compete radius')
    if(!props.agreement.nonsolicitTerm) push('Non-solicit term')
    if(employerState === 'Illinois' && !props.agreement.restrictiveCovenantConsideration) push('Restrictive covenant consideration')

    setMissingList(list)

  }, [changed, props.agreement, props.entities, props.practices, props.doctor, employerState, location1, location2, location3])

  const handlePracticeIdChange = (key: 1|2|3) => (v: string) => {
    if(key === 1) {
      if(v === 'New') {
        setLocation1(emptyLocation)
        setAgreement({ ...agreement, location1Practice: undefined })
      } else {
        for(const practice of props.practices) {
          if(practice._id !== v) continue
          setLocation1(practice)
          setAgreement({ ...agreement, location1Practice: practice._id })
        }
      }
    } else if(key === 2) {
      if(v === 'New') {
        setLocation2(emptyLocation)
        setAgreement({ ...agreement, location2Practice: undefined })
      } else {
        for(const practice of props.practices) {
          if(practice._id !== v) continue
          setLocation2(practice)
          setAgreement({ ...agreement, location2Practice: practice._id })
        }
      }
    } else if(key === 3) {
      if(v === 'New') {
        setLocation3(emptyLocation)
        setAgreement({ ...agreement, location3Practice: undefined })
      } else {
        for(const practice of props.practices) {
          if(practice._id !== v) continue
          setLocation3(practice)
          setAgreement({ ...agreement, location3Practice: practice._id })
        }
      }
    }
  }

  const handleCompModelChange = (model: typeof CompModels[keyof typeof CompModels]) => {
    let augmentation = {
      hourlyRate: 0,
      dailyRate: 0,
      salary: 0,
      draw: 0,
      growthBonusPercentage: 0,
      productionPercentage: 0,
      numberOfTiers: 0,
      tier1Percentage: 0,
      tier1Threshold: 0,
      tier2Percentage: 0,
      tier2Threshold: 0,
      tier3Percentage: 0
    }

    if(model === 'Production with Annual Draw') {
      augmentation.productionPercentage = agreement.productionPercentage || 0
      augmentation.draw = agreement.draw || 0
    } else if (model === 'Production with Guaranteed Base Salary') {
      augmentation.productionPercentage = agreement.productionPercentage || 0
      augmentation.salary = agreement.salary || 0
    } else if (model === 'Straight Salary with bonus') {
      augmentation.salary = agreement.salary || 0
      augmentation.growthBonusPercentage = agreement.growthBonusPercentage || 0
    } else if (model === 'Straight Salary without bonus') {
      augmentation.salary = agreement.salary || 0
    } else if (model === 'Tiered Production with Annual Draw') {
      augmentation.numberOfTiers = 2
      augmentation.draw = agreement.draw || 0
    } else if (model === 'Tiered Production with Guaranteed Base Salary') {
      augmentation.numberOfTiers = 2
      augmentation.salary = agreement.salary || 0
    }

    setAgreement({
      ...agreement, 
      compensationModel: model,
      ...augmentation
    })
  }

  const handleEmployerChange = (v: string) => {
    for(const entity of props.entities) {
      if(entity._id !== v) continue
      setAgreement({
        ...agreement,
        employer: entity._id,
        restrictiveCovenantConsideration: entity.state === 'Illinois' ? 2000 : 0
      })
    }
  }

  const handleFTPTChange = (ft: boolean) => {
    if(ft) {
      setAgreement({
        ...agreement,
        ftpt: 'Full Time',
        vacationDays: 10,
        ceDays: 3,
        ceReimbursementLimit: 1500,
        reimbursementLicense: true,
        reimbursementDEA: false,
        reimbursementCOVD: false,
      })
    } else {
      setAgreement({
        ...agreement,
        ftpt: 'Part Time',
        vacationDays: 0,
        ceDays: 0,
        ceReimbursementLimit: 0,
        reimbursementLicense: false,
        reimbursementDEA: false,
        reimbursementCOVD: false,
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let res = await fetch('/api/agreements/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          agreement,
          doctor,
          location1,
          location2,
          location3
        })
      })
      if(!res.ok) throw new Error('Error during update')
      router.refresh()

    } catch(e) {
      console.log(e)
      message('Failed to save', 'error')
    }
    setSaving(false)
  }

  const downloadCSV = async () => {


    const csvConfig = mkConfig({
      filename: 'agreementCSV',
      columnHeaders: [
        { key: 'seller', displayLabel: 'Seller' },
        { key: 'newAcquisition', displayLabel: 'New Acquisition' },
        { key: 'employerState', displayLabel: 'AEG Practice State' },
        { key: 'newAgrType', displayLabel: 'New Agreement Type' },
        { key: 'newAgrEffectiveDate', displayLabel: 'New Agreement Effective Date' },
        { key: 'originalType', displayLabel: 'Original Agreement Type' },
        { key: 'originalEffectiveDate', displayLabel: 'Original Agreement Effective Date' },
        { key: 'SECD', displayLabel: 'Regional Director of Eyecare' },
        { key: 'hrbp', displayLabel: 'HR Business Partner' },
        { key: 'hrbpEmail', displayLabel: 'HRBP Email' },
        { key: 'ODLastName', displayLabel: 'OD Last Name' },
        { key: 'ODFirstName', displayLabel: 'OD First Name' },
        { key: 'ODEmail', displayLabel: 'OD Email Address' },
        { key: 'ODStreet', displayLabel: 'OD Address - Street' },
        { key: 'ODCity', displayLabel: 'OD Address - City' },
        { key: 'ODState', displayLabel: 'OD Address - State' },
        { key: 'ODZip', displayLabel: 'OD Address - Zip Code' },
        { key: 'compModel', displayLabel: 'Compensation Model' },
        { key: 'hourlyRate', displayLabel: 'Hourly Rate' },
        { key: 'dailyRate', displayLabel: 'Daily Rate' },
        { key: 'salary', displayLabel: 'Base Salary' },
        { key: 'draw', displayLabel: 'Draw Amount' },
        { key: 'growthBonus', displayLabel: 'Growth Bonus Percentage' },
        { key: 'production', displayLabel: 'Production Percentage' },
        { key: 'numTiers', displayLabel: 'Number of Tiers' },
        { key: 'tier1Percentage', displayLabel: 'Tier 1 Percentage' },
        { key: 'tier1Threshold', displayLabel: 'Tier 1 Threshold' },
        { key: 'tier2Percentge', displayLabel: 'Tier 2 Percentage' },
        { key: 'tier2Threshold', displayLabel: 'Tier 2 Threshold' },
        { key: 'tier3Percentage', displayLabel: 'Tier 3 Percentage' },
        { key: 'earlyTermDamages', displayLabel: 'Early Termination Damages per Day' },
        { key: 'term', displayLabel: 'Agreement Term' },
        { key: 'termUnits', displayLabel: 'Agreement Term Units' },
        { key: 'renewalTerm', displayLabel: 'Renewal Term' },
        { key: 'renewalTermUnits', displayLabel: 'Renewal Term Units' },
        { key: 'termNotice', displayLabel: 'Termination Notice Period' },
        { key: 'numLocations', displayLabel: 'Number of Locations' },
        { key: 'loc1number', displayLabel: 'Location 1 Practice Number' },
        { key: 'loc1street', displayLabel: 'Location 1 Street' },
        { key: 'loc1city', displayLabel: 'Location 1 City' },
        { key: 'loc1state', displayLabel: 'Location 1 State' },
        { key: 'loc1zip', displayLabel: 'Location 1 Zip Code' },
        { key: 'loc2number', displayLabel: 'Location 2 Practice Number' },
        { key: 'loc2street', displayLabel: 'Location 2 Street' },
        { key: 'loc2city', displayLabel: 'Location 2 City' },
        { key: 'loc2state', displayLabel: 'Location 2 State' },
        { key: 'loc2zip', displayLabel: 'Location 2 Zip Code' },
        { key: 'loc3number', displayLabel: 'Location 3 Practice Number' },
        { key: 'loc3street', displayLabel: 'Location 3 Street' },
        { key: 'loc3city', displayLabel: 'Location 3 City' },
        { key: 'loc3state', displayLabel: 'Location 3 State' },
        { key: 'loc3zip', displayLabel: 'Location 3 Zip Code' },
        { key: 'workSchedule', displayLabel: 'Work Schedule' },
        { key: 'satPerMonth', displayLabel: 'Saturdays per Month' },
        { key: 'ftpt', displayLabel: 'Full or Part Time' },
        { key: 'vacationDays', displayLabel: 'Vacation Days' },
        { key: 'ceDays', displayLabel: 'CE Days' },
        { key: 'ceReimbursement', displayLabel: 'CE Reimbursement Limit' },
        { key: 'liceneRenewal', displayLabel: 'License Renewal Policy' },
        { key: 'nonCompeteTerm', displayLabel: 'Noncompete Term' },
        { key: 'nonCompeteRadius', displayLabel: 'Noncompete Radius' },
        { key: 'nonSolicitTerm', displayLabel: 'Nonsolicit Term' },
        { key: 'restrictiveCovenantConsideration', displayLabel: 'Restrictive Covenant Consideration' },
        { key: 'notes', displayLabel: 'Notes' },
        { key: 'submittedBy', displayLabel: 'Submitted By' },
        { key: 'created', displayLabel: 'Created' },
        // { key: 'vacationType', displayLabel: 'Vacation Type' },
        // { key: 'effectiveDateString', displayLabel: 'New Agreement Effective Date String' },
        // { key: 'originalEffectiveDateString', displayLabel: 'Original Agreement Effective Date String' },
        // { key: 'nonCompeteTerm2', displayLabel: 'Noncompete Term 2' },
        // { key: 'nonCompeteTerm3', displayLabel: 'Noncompete Term 3' },
        // { key: 'nonCompeteRadius2', displayLabel: 'Noncompete Radius 2' },
        // { key: 'nonCompeteRadius3', displayLabel: 'Noncompete Radius 3' },
        // { key: 'nonSolicitTerm2', displayLabel: 'Nonsolicit Term 2' },
        // { key: 'nonSolicitTerm3', displayLabel: 'Nonsolicit Term 3' },
        // { key: 'state', displayLabel: 'State' },
        // { key: 'entityName', displayLabel: 'PC Name' },
        // { key: 'state', displayLabel: 'PC State' },
        // { key: 'entitySigntory', displayLabel: 'PC Signatory' },
        // { key: 'entitySigTitle', displayLabel: 'PC Signatory Title' },
      ]
    });

    try {
      let res = await fetch('/api/agreements/csv', {
        method: 'GET',
        headers: {agreementId: props.agreement._id},
      })
      if(!res.ok) throw new Error()
      let data = await res.json()
      const csv = generateCsv(csvConfig)([data]);
      download(csvConfig)(csv)
      router.refresh()
    } catch(e) {
      message('Failed to download CSV', 'error')
    }

  }


  return (
    <div className='flex flex-col gap-3 grow overflow-hidden'>
      <div className='gap-3 flex'>
        <Button
          onClick={props.clear}
        >Back</Button>
        <Button
          disabled={!changed}
          onClick={handleSave}
          loading={saving}
        >Save</Button>
        {missingList.length ? (
          <Tooltip title={() => (
            <ul>
              {missingList.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}>
            <Button disabled>CSV</Button>
          </Tooltip>
        ) : (
          <Button onClick={downloadCSV}>CSV</Button>
        )}
        
      </div>
      <div className='flex gap-3 overflow-y-auto'>
        <div className='grow basis-0.5' style={{ maxWidth: '50%'}}>
          <AgreementForm
            agreement={agreement}
            setAgreement={setAgreement}
            doctor={doctor}
            setDoctor={setDoctor}
            location1={location1}
            setLocation1={setLocation1}
            location2={location2}
            setLocation2={setLocation2}
            location3={location3}
            setLocation3={setLocation3}
            employerState={employerState}
            handlePracticeIdChange={handlePracticeIdChange}
            handleCompModelChange={handleCompModelChange}
            handleEmployerChange={handleEmployerChange}
            handleFTPTChange={handleFTPTChange}
            entities={props.entities}
            practices={props.practices}
          />
        </div>
        {/* <div className='grow basis-1'>
          <Collapse
            items={fields}
            activeKey={activePanels}
            size='small'
            onChange={setActivePanels}
          />
        </div> */}
      

      </div>
    </div>
  )
}

type AgreementFormProps = {
  agreement: IAgreement
  setAgreement: (s: IAgreement) => void
  doctor: IDoctor
  setDoctor: (s: IDoctor) => void
  location1: Partial<IPractice>
  setLocation1: (s: Partial<IPractice>) => void
  location2: Partial<IPractice>
  setLocation2: (s: Partial<IPractice>) => void
  location3: Partial<IPractice>
  setLocation3: (s: Partial<IPractice>) => void
  employerState: string | void
  handlePracticeIdChange: (k: 1|2|3) => SelectProps['onChange']
  handleCompModelChange: (m: typeof CompModels[keyof typeof CompModels]) => void
  handleEmployerChange: (v: string) => void
  handleFTPTChange: (ft: boolean) => void
  entities: IEntity[]
  practices: IPractice[]
}

const AgreementForm = ({
  agreement,
  setAgreement,
  doctor,
  setDoctor,
  location1,
  setLocation1,
  location2,
  setLocation2,
  location3,
  setLocation3,
  employerState,
  handlePracticeIdChange,
  handleCompModelChange,
  handleEmployerChange,
  handleFTPTChange,
  ...props
}: AgreementFormProps) => {
  const [ activePanels, setActivePanels ] = React.useState<string[]|string>([
    'general',
    'optometrist',
    'compensation',
    'term',
    'locations',
    'workschedule',
    'benefits',
    'restrictive covenants'
  ])

  const fields: CollapseProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Row>
          <Col span={16} className='flex flex-col'>
            <Label title='Agreement Type'/>
            <Select
              options={Object.values(AgreementTypes).map(type => (
                { value: type, label: type, disabled: type === 'Amendment' ? true : false}
              ))}
              disabled={Boolean(agreement.type === 'Amendment')}
              onChange={v => setAgreement({...agreement, type: v})}
              style={{ width: 250 }}
              value={agreement.type}
              className='mb-3'
              size='small'
            />
            <Label title='Effective Date'/>
            <DatePicker
              value={dayjs(agreement.effectiveDate)}
              onChange={(d,s) => setAgreement({...agreement, effectiveDate: d.toISOString()})}
              size='small'
              style={{ width: 250 }}
              className='mb-3'
            />
            <Label title='Employer'/>
            <Select
              options={props.entities.map(entity => ({ value: entity._id, label: `${entity.state} - ${entity.name}`}))}
              onChange={v => handleEmployerChange(v)}
              style={{ width: 300 }}
              value={agreement.employer}
              size='small'
            />
          </Col>
          <Col span={8} className='flex flex-col gap-3'>
            <Checkbox
              checked={agreement.newAcquisition}
              onChange={e => setAgreement({
                ...agreement, 
                newAcquisition: e.target.checked,
                seller: !e.target.checked ? false : agreement.seller
              })}
            >New Acquisition</Checkbox>
            {agreement.newAcquisition ? (
              <Checkbox
                checked={agreement.seller}
                onChange={e => setAgreement({...agreement, seller: e.target.checked})}
              >Selling Doctor</Checkbox>
            ) : null}
          </Col>
        </Row>
      )
    },
    {
      key: 'optometrist',
      label: 'Optometrist (also updates Profile)',
      children: (
        <div className='flex flex-col gap-3'>
          <Row gutter={[10,10]}>
            <Col span={12}>
              <Label title='First Name'/>
              <Input
                value={doctor.firstName}
                onChange={e => setDoctor({ ...doctor, firstName: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Label title='Last Name'/>
              <Input
                value={doctor.lastName}
                onChange={e => setDoctor({ ...doctor, lastName: e.target.value })}
              />
            </Col>
          </Row>
          <Row gutter={[10,10]}>
            <Col span={12}>
              <Label title='Personal Email'/>
              <Input
                value={doctor.emailPersonal}
                onChange={e => setDoctor({ ...doctor, emailPersonal: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Label title='Business Email'/>
              <Input
                value={doctor.emailBusiness}
                onChange={e => setDoctor({ ...doctor, emailBusiness: e.target.value })}
              />
            </Col>
          </Row>
          <Row gutter={[10,10]}>
            <Col span={12}>
              <Label title='Street 1'/>
              <Input
                value={doctor.personalStreet1}
                onChange={e => setDoctor({ ...doctor, personalStreet1: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <Label title='Street 2'/>
              <Input
                value={doctor.personalStreet2}
                onChange={e => setDoctor({ ...doctor, personalStreet2: e.target.value })}
              />
            </Col>
          </Row>
          <Row gutter={[10,10]}>
            <Col span={8}>
              <Label title='City'/>
              <Input
                value={doctor.personalCity}
                onChange={e => setDoctor({ ...doctor, personalCity: e.target.value })}
              />
            </Col>
            <Col span={8}>
              <Label title='State'/>
              <Input
                value={doctor.personalState}
                onChange={e => setDoctor({ ...doctor, personalState: e.target.value })}
              />
            </Col>
            <Col span={8}>
              <Label title='Zip'/>
              <Input
                value={doctor.personalZip}
                onChange={e => setDoctor({ ...doctor, personalZip: e.target.value })}
              />
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'compensation',
      label: 'Compensation',
      children: (
        <div>
          <Row>
            <Col span={8} className='flex flex-col'>
              <Label title='Comp Model'/>
              <Select
                options={Object.values(CompModels).map(type => (
                  { value: type, label: type }
                ))}
                onChange={handleCompModelChange}
                style={{ width: 350 }}
                value={agreement.compensationModel}
                className='mb-3'
                size='small'
              />
            </Col>
          </Row>
          {agreement.compensationModel === 'Hourly' ? (
            <Row>
              <Col span={8} className='flex flex-col'>
                <Label title='Hourly Rate ($)'/>
                <InputNumber
                  value={agreement.hourlyRate || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, hourlyRate: v})}
                  size='small'
                />
              </Col>
            </Row>
          ) : agreement.compensationModel === 'Daily' ? (
            <Row>
              <Col span={8} className='flex flex-col'>
                <Label title='Daily Rate ($)'/>
                <InputNumber
                  value={agreement.dailyRate || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, dailyRate: v})}
                  size='small'
                />
              </Col>
            </Row>
          ) : agreement.compensationModel === 'Production with Annual Draw' ? (
            <Row>
              <Col span={8} className='flex flex-col'>
                <Label title='Annual Draw ($)'/>
                <InputNumber
                  value={agreement.draw || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, draw: v})}
                  size='small'
                />
              </Col>
              <Col span={8} className='flex flex-col'>
                <Label title='Production Percentage'/>
                <InputNumber
                  value={agreement.productionPercentage || 0}
                  min={0}
                  max={100}
                  formatter={(value) => `${value ? Math.round(value*10)/10 : 0}%`}
                  step={0.5}
                  onChange={v => {
                    setAgreement({...agreement, productionPercentage: v})
                  }}
                  size='small'
                />
              </Col>
            </Row>
          ) : agreement.compensationModel === 'Production with Guaranteed Base Salary' ? (
            <Row>
              <Col span={8} className='flex flex-col'>
                <Label title='Salary ($)'/>
                <InputNumber
                  value={agreement.salary || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, salary: v})}
                  size='small'
                />
              </Col>
              <Col span={8} className='flex flex-col'>
                <Label title='Production Percentage'/>
                <InputNumber
                  value={agreement.productionPercentage || 0}
                  min={0}
                  max={100}
                  formatter={(value) => `${value ? Math.round(value*10)/10 : 0}%`}
                  step={0.5}
                  onChange={v => {
                    setAgreement({...agreement, productionPercentage: v})
                  }}
                  size='small'
                />
              </Col>

            </Row>
          ) : agreement.compensationModel === 'Straight Salary with bonus' ? (
            <Row>
              <Col span={8} className='flex flex-col'>
                <Label title='Salary ($)'/>
                <InputNumber
                  value={agreement.salary || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, salary: v})}
                  size='small'
                />
              </Col>
              <Col span={8} className='flex flex-col'>
                <Label title='Growth Bonus (%)'/>
                <InputNumber
                  value={agreement.growthBonusPercentage || 0}
                  min={0}
                  max={100}
                  formatter={(value) => `${value ? Math.round(value*10)/10 : 0}%`}
                  step={0.5}
                  onChange={v => {
                    setAgreement({...agreement, growthBonusPercentage: v})
                  }}
                  size='small'
                />
              </Col>
            </Row>
          ) : agreement.compensationModel === 'Straight Salary without bonus' ? (
            <Row>
              <Col span={8} className='flex flex-col'>
                <Label title='Salary ($)'/>
                <InputNumber
                  value={agreement.salary || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, salary: v})}
                  size='small'
                />
              </Col>
            </Row>
          ) : agreement.compensationModel === 'Tiered Production with Annual Draw' || agreement.compensationModel === 'Tiered Production with Guaranteed Base Salary' ? (
            <Row className='mb-2'>
              {agreement.compensationModel === 'Tiered Production with Annual Draw' ? (
                <Col span={8} className='flex flex-col'>
                  <Label title='Draw ($)'/>
                  <InputNumber
                    value={agreement.draw || 0}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChange={v => setAgreement({...agreement, draw: v})}
                    size='small'
                  />
                </Col>
              ) : (
                <Col span={8} className='flex flex-col'>
                  <Label title='Salary ($)'/>
                  <InputNumber
                    value={agreement.salary || 0}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChange={v => setAgreement({...agreement, salary: v})}
                    size='small'
                  />
                </Col>
              )}
              <Col span={8} className='flex flex-col'>
                <Label title='# of Tiers'/>
                <InputNumber
                  value={agreement.numberOfTiers || 2}
                  min={2}
                  max={3}
                  onChange={v => setAgreement({...agreement, numberOfTiers: Math.round(v || 2)})}
                  size='small'
                />
              </Col>
              
            </Row>
          ) : null}
          {agreement.compensationModel === 'Tiered Production with Annual Draw' || agreement.compensationModel === 'Tiered Production with Guaranteed Base Salary' ? (
            <>
            <Row className='mb-2'>
              <Col span={8} className='flex flex-col'>
                <Label title='Tier 1 Production (%)'/>
                <InputNumber
                  value={agreement.tier1Percentage || 0}
                  min={0}
                  max={100}
                  formatter={(value) => `${value ? Math.round(value*10)/10 : 0}%`}
                  step={0.5}
                  onChange={v => {
                    setAgreement({...agreement, tier1Percentage: v})
                  }}
                  size='small'
                />
              </Col>
              <Col span={8} className='flex flex-col'>
                <Label title='Tier 1 Threshold ($)'/>
                <InputNumber
                  value={agreement.tier1Threshold || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, tier1Threshold: v})}
                  size='small'
                />
              </Col>
              
            </Row>
            <Row className='mb-2'>
              <Col span={8} className='flex flex-col'>
                <Label title='Tier 2 Production (%)'/>
                <InputNumber
                  value={agreement.tier2Percentage || 0}
                  min={0}
                  max={100}
                  formatter={(value) => `${value ? Math.round(value*10)/10 : 0}%`}
                  step={0.5}
                  onChange={v => {
                    setAgreement({...agreement, tier2Percentage: v})
                  }}
                  size='small'
                />
              </Col>
              {agreement.numberOfTiers === 3 ? (
                <Col span={8} className='flex flex-col'>
                  <Label title='Tier 2 Threshold ($)'/>
                  <InputNumber
                    value={agreement.tier2Threshold || 0}
                    min={agreement.tier1Threshold || 0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChange={v => setAgreement({...agreement, tier2Threshold: v})}
                    size='small'
                  />
                </Col>
              ) : null}
            </Row>
            <Row className='mb-2'>
              {agreement.numberOfTiers === 3 ? (
                <Col span={8} className='flex flex-col'>
                  <Label title='Tier 3 Production (%)'/>
                  <InputNumber
                    value={agreement.tier3Percentage || 0}
                    min={0}
                    max={100}
                    formatter={(value) => `${value ? Math.round(value*10)/10 : 0}%`}
                    step={0.5}
                    onChange={v => {
                      setAgreement({...agreement, tier3Percentage: v})
                    }}
                    size='small'
                  />
                </Col>
              ): null}
            </Row>
            </>
          ) : null}
        </div>
      )
    },
    {
      key: 'term',
      label: 'Term',
      children: (
        <div className='flex flex-col gap-3'>
          <Row>
            <Col span={8}>
              <Label title='Initial Term'/>
              <InputNumber
                value={agreement.term}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, term: Math.round(v || 1)})}
              />
            </Col>
            <Col span={8}>
              <Label title='Initial Term Units'/>
              <Select
                options={[
                  {value: 'Years', label: 'Years' },
                  {value: 'Months', label: 'Months'}
                ]}
                onChange={v => setAgreement({...agreement, termUnits: v})}
                style={{ width: 100 }}
                value={agreement.termUnits}
                size='small'
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Label title='Renewal Term'/>
              <InputNumber
                value={agreement.renewalTerm}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, renewalTerm: Math.round(v || 1)})}
              />
            </Col>
            <Col span={8}>
              <Label title='Renewal Term Units'/>
              <Select
                options={[
                  {value: 'Years', label: 'Years' },
                  {value: 'Months', label: 'Months'}
                ]}
                onChange={v => setAgreement({...agreement, renewalTermUnits: v})}
                style={{ width: 100 }}
                value={agreement.renewalTermUnits}
                size='small'
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Label title='Termination Notice Period'/>
              <InputNumber
                value={agreement.termNoticePeriod}
                size='small'
                min={60}
                step={30}
                formatter={v => `${v} days`}
                onStep={v => setAgreement({...agreement, termNoticePeriod: Math.round(v || 90)})}
              />
            </Col>
            <Col span={8}>
              <Label title='Early Term. Damages (per day)'/>
              <InputNumber
                value={agreement.earlyTermDamages || 0}
                size='small'
                min={50}
                onChange={v => setAgreement({...agreement, earlyTermDamages: Math.round(v || 50)})}
              />
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'locations',
      label: 'Locations',
      children: (
        <div className='flex flex-col gap-3'>
          <Row>
            <Col span={8}>
              <Label title='# of Locations'/>
              <InputNumber
                value={agreement.locationsNumber || 1}
                size='small'
                min={1}
                max={3}
                step={1}
                onStep={v => setAgreement({...agreement, locationsNumber: Math.round(v)})}
              />
            </Col>
          </Row>
          <Divider className=' mt-1 mb-1'/>
          <Row gutter={[10, 10]}>
            <Col span={12}>
              <Label title='Practice #1 - ID '/>
              <Select
                options={[
                  { value: 'New', label: 'New' },
                  ...props.practices.map(practice => ({ value: practice._id, label: `${practice.id || 'NEW'} - ${practice.name}`}))
                ]}
                onChange={handlePracticeIdChange(1)}
                style={{ width: '100%' }}
                value={agreement.location1Practice || 'New'}
                size='small'
              />
            </Col>
            <Col span={12}>
              <Label title='Name'/>
              <Input
                value={location1.name || ''}
                size='small'
                onChange={e => setLocation1({...location1, name: e.target.value})}
                disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
              />
            </Col>
          </Row>
          <Row gutter={[10, 10]}>
            <Col span={12}>
              <Label title='Street 1'/>
              <Input
                value={location1.street1 || ''}
                size='small'
                onChange={e => setLocation1({...location1, street1: e.target.value})}
                disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
              />
            </Col>
            <Col span={6}>
              <Label title='Street 2'/>
              <Input
                value={location1.street2 || ''}
                size='small'
                onChange={e => setLocation1({...location1, street2: e.target.value})}
                disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
              />
            </Col>
            <Col span={6}>
              <Label title='City'/>
              <Input
                value={location1.city || ''}
                size='small'
                onChange={e => setLocation1({...location1, city: e.target.value})}
                disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
              />
            </Col>
          </Row>
          <Row gutter={[10, 10]}>
            <Col span={6}>
              <Label title='State'/>
              <Input
                value={location1.state || ''}
                size='small'
                onChange={e => setLocation1({...location1, state: e.target.value})}
                disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
              />
            </Col>
              <Col span={6}>
                <Label title='Zip'/>
                <Input
                  value={location1.zip || ''}
                  size='small'
                  onChange={e => setLocation1({...location1, zip: e.target.value})}
                  disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
                />
            </Col>
            <Col span={12}>
              <Label title='SECD Name'/>
              <Input
                value={location1.SECDName || ''}
                size='small'
                onChange={e => setLocation1({...location1, SECDName: e.target.value})}
                disabled={Boolean(agreement.location1Practice && agreement.location1Practice !== 'New')}
              />
            </Col>
          </Row>


          {agreement.locationsNumber && agreement.locationsNumber >= 2 ? (
            <>
            <Divider className=' mt-1 mb-1'/>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Label title='Practice #2 - ID'/>
                <Select
                  options={[
                    { value: 'New', label: 'New' },
                    ...props.practices.map(practice => ({ value: practice._id, label: `${practice.id || 'NEW'} - ${practice.name}`}))
                  ]}
                  onChange={handlePracticeIdChange(2)}
                  style={{ width: '100%' }}
                  value={agreement.location2Practice || 'New'}
                  size='small'
                />
              </Col>
              <Col span={12}>
                <Label title='Name'/>
                <Input
                  value={location2.name || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, name: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
            </Row>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Label title='Street 1'/>
                <Input
                  value={location2.street1 || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, street1: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
              <Col span={6}>
                <Label title='Street 2'/>
                <Input
                  value={location2.street2 || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, street2: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
              <Col span={6}>
                <Label title='City'/>
                <Input
                  value={location2.city || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, city: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
            </Row>
            <Row gutter={[10, 10]}>
              <Col span={6}>
                <Label title='State'/>
                <Input
                  value={location2.state || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, state: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
              <Col span={6}>
                <Label title='Zip'/>
                <Input
                  value={location2.zip || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, zip: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
              <Col span={12}>
                <Label title='SECD Name'/>
                <Input
                  value={location2.SECDName || ''}
                  size='small'
                  onChange={e => setLocation2({...location2, SECDName: e.target.value})}
                  disabled={Boolean(agreement.location2Practice && agreement.location2Practice !== 'New')}
                />
              </Col>
            </Row>
            </>
          ) : null}
          {agreement.locationsNumber === 3 ? (
            <>
            <Divider className=' mt-1 mb-1'/>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Label title='Practice #3 - ID'/>
                <Select
                  options={[
                    { value: 'New', label: 'New' },
                    ...props.practices.map(practice => ({ value: practice._id, label: `${practice.id || 'NEW'} - ${practice.name}`}))
                  ]}
                  onChange={handlePracticeIdChange(3)}
                  style={{ width: '100%' }}
                  value={agreement.location3Practice || 'New'}
                  size='small'
                />
              </Col>
              <Col span={12}>
                <Label title='Name'/>
                <Input
                  value={location3.name || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, name: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
            </Row>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Label title='Street 1'/>
                <Input
                  value={location3.street1 || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, street1: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
              <Col span={6}>
                <Label title='Street 2'/>
                <Input
                  value={location3.street2 || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, street2: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
              <Col span={6}>
                <Label title='City'/>
                <Input
                  value={location3.city || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, city: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
            </Row>
            <Row gutter={[10, 10]}>
              <Col span={6}>
                <Label title='State'/>
                <Input
                  value={location3.state || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, state: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
              <Col span={6}>
                <Label title='Zip'/>
                <Input
                  value={location3.zip || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, zip: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
              <Col span={12}>
                <Label title='SECD Name'/>
                <Input
                  value={location3.SECDName || ''}
                  size='small'
                  onChange={e => setLocation2({...location3, SECDName: e.target.value})}
                  disabled={Boolean(agreement.location3Practice && agreement.location3Practice !== 'New')}
                />
              </Col>
            </Row>
            </>
          ) : null}
        </div>
      )
    },
    {
      key: 'workschedule',
      label: 'Work Schedule',
      children: (
        <div className='flex flex-col gap-3'>
          <Row>
            <Col span={16}>
              <Input.TextArea
                value={agreement.workSchedule}
                autoSize={true}
                style={{ minHeight: 80 }}
                placeholder='Schedule...'
                onChange={e => setAgreement({ ...agreement, workSchedule: e.target.value })}
              />
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'benefits',
      label: 'Benefits',
      children: (
        <div className='flex flex-col gap-3'>
          <Row>
            <Col span={8}>
              <Label title='Full-Time?'/>
              <Checkbox
                checked={agreement.ftpt === 'Full Time'}
                onChange={e => handleFTPTChange(e.target.checked)}
              >Eligible for benefits</Checkbox> 
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Label title='Vacation Days'/>
              <InputNumber
                value={agreement.vacationDays}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, vacationDays: Math.round(v || 1)})}
              />
            </Col>
            <Col span={8}>
              <Label title='CE Days'/>
              <InputNumber
                value={agreement.ceDays}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, ceDays: Math.round(v || 1)})}
              />
            </Col>
            <Col span={8}>
              <Label title='CE Reimbursement Limit ($)'/>
                <InputNumber
                  value={agreement.ceReimbursementLimit || 0}
                  min={0}
                  step={500}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onStep={v => setAgreement({...agreement, ceReimbursementLimit: Math.round(v)})}
                  size='small'
                />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Label title='Other Reimbursements'/>
              <Checkbox
                checked={agreement.reimbursementLicense}
                onChange={e => setAgreement({ ...agreement, reimbursementLicense: e.target.checked})}
              >Optometry License</Checkbox> 
            </Col>
            <Col span={8}>
              <Label title=''/>
              <Checkbox
                checked={agreement.reimbursementDEA}
                onChange={e => setAgreement({ ...agreement, reimbursementDEA: e.target.checked})}
              >DEA Permit</Checkbox> 
            </Col>
            <Col span={8}>
              <Label title=''/>
              <Checkbox
                checked={agreement.reimbursementCOVD}
                onChange={e => setAgreement({ ...agreement, reimbursementCOVD: e.target.checked})}
              >COVD Certificate</Checkbox> 
            </Col>
          </Row>
          <Row>
            <Col span={16}>
              <Label title='Notes'/>
              <Input.TextArea
                value={agreement.notes}
                autoSize={true}
                style={{ minHeight: 80 }}
                placeholder='Schedule...'
                onChange={e => setAgreement({ ...agreement, notes: e.target.value })}
              />
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'restrictive covenants',
      label: 'Restrictive Covenants',
      children: (
        <div className='flex flex-col gap-3'>
          <Row>
            <Col span={8}>
              <Label title='Non-compete Term (months)'/>
              <InputNumber
                value={agreement.noncompeteTerm || 24}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, noncompeteTerm: Math.round(v || 0)})}
              />
            </Col>
            <Col span={8}>
              <Label title='Non-compete Radius (miles)'/>
              <InputNumber
                value={agreement.noncompeteRadius || 10}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, noncompeteRadius: Math.round(v || 0)})}
              />
            </Col>
            <Col span={8}>
              <Label title='Non-solicit Term (months)'/>
              <InputNumber
                value={agreement.nonsolicitTerm || 24}
                size='small'
                min={0}
                onChange={v => setAgreement({...agreement, nonsolicitTerm: Math.round(v || 0)})}
              />
            </Col>
          </Row>
          {employerState === 'Illinois' ? (
            <Row>
              <Col span={8}>
                <Label title='Restrictive Covenant Consideration'/>
                <InputNumber
                  value={agreement.restrictiveCovenantConsideration || 0}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={v => setAgreement({...agreement, restrictiveCovenantConsideration: v})}
                  size='small'
                />
              </Col>
            </Row>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <Collapse
      items={fields}
      activeKey={activePanels}
      size='small'
      onChange={setActivePanels}
    />
  )
}