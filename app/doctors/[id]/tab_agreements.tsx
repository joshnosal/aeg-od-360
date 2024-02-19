'use client'

import { IAgreement } from '@/database/models/agreement'
import { IDoctor } from '@/database/models/doctor'
import { Button, Table, TableProps, Menu, MenuProps, Dropdown, Tooltip, Space, Popconfirm } from 'antd'
import React, { MouseEventHandler } from 'react'
import { useRouter } from 'next/navigation'
import { MoreOutlined } from '@ant-design/icons'
import EditModal from './modal_edit'
import { IPractice } from '@/database/models/practice'
import { IEntity } from '@/database/models/entity'
import { missingCSVData } from './form_agreement'
import { mkConfig, generateCsv, download } from "export-to-csv";
import { AppContext } from '@/utils/AppContext'
import UploadModal from './modal_upload'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

type Props = {
  doctor: IDoctor
  agreements: IAgreement[]
  practices: IPractice[]
  entities: IEntity[]
}

type NextSteps = 'Request Draft'|'Download CSV'|'Upload Draft'|'Upload Final'|'Terminate'|null

export default function AgreementsTab(props: Props){
  const router = useRouter()
  const [ selectedAgrId, setSelectedAgrId ] = React.useState<string|void>()
  const [ openModal, setOpenModal ] = React.useState<'upload'|'edit'|void>()
  const [ uploadType, setuploadType ] = React.useState<'draft'|'signed'>()
  const { message } = React.useContext(AppContext)

  const createAgreement = async (type: 'Employment Agreement'|'Offer Letter'|'Amendment'|void) => {
    try {
      let res = await fetch('/api/agreements/new', {
        method: 'GET',
        headers: { doctorId: props.doctor._id }
      })
      if(!res.ok) throw new Error('Failed to GET')
      const data: IAgreement = await res.json()
      setSelectedAgrId(data._id)
      setOpenModal('edit')
    } catch(e) {
      console.log(e)
    }
    router.refresh()
  }

  const downloadCSV = async (id: string) => {

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
        { key: 'fullTime', displayLabel: 'Full or Part Time' },
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
        headers: {agreementId: id},
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

  const handleNextStep = (step: NextSteps, id: string) => async () => {
    try {
      if(step === 'Request Draft') {
        await fetch('/api/agreements/request_draft', { method: 'GET', headers: {agreementId: id}})
      } else if (step === 'Download CSV') {
        downloadCSV(id)
      } else if (step === 'Upload Draft') {
        setSelectedAgrId(id)
        setuploadType('draft')
        setOpenModal('upload')
      } else if (step === 'Upload Final') {
        setSelectedAgrId(id)
        setuploadType('signed')
        setOpenModal('upload')
      } else if (step === 'Terminate') {
        await fetch('/api/agreements/terminate', { method: 'GET', headers: {agreementId: id}})
      }
      router.refresh()
    } catch(e) {
      message(`Failed to ${step}`, 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      let res = await fetch('/api/agreements/delete', {
        headers: {agreementId: id}
      })
      if(!res.ok) throw new Error()
      await res.json()
      router.refresh()
    } catch(e) {
      console.log(e)
    }
  }

  // const renderMenuButton = (v: any, r: IAgreement, csv: boolean) => {
  //   const menuItems: MenuProps['items'] = [
  //     {
  //       key: 'edit',
  //       label: 'Edit',
  //       onClick: () => {
  //         setSelectedAgrId(r._id)
  //         setOpenModal('edit')
  //       }
  //     },
  //     {
  //       key: 'downloadCSV',
  //       label: 'Download CSV',
  //       disabled: !csv,
  //       onClick: () => downloadCSV(r._id)
  //     }, {
  //     key: 'upload',
  //     label: 'Upload',
  //     disabled: r.status !== 'Drafting' || new Date(r.updatedAt).getTime() - 5000 > new Date(r.csvDownload).getTime(),
  //     onClick: () => {
  //       setSelectedAgrId(r._id)
  //       setOpenModal('upload')
  //     }
  //   }, {
  //     key: 'download',
  //     label: 'Download',
  //     disabled: !r.file
  //   }, {
  //     key: 'delete',
  //     label: 'Delete',
  //     onClick: async () => {
  //       try {
  //         let res = await fetch('/api/agreements/delete', {
  //           headers: {agreementId: r._id}
  //         })
  //         if(!res.ok) throw new Error()
  //         await res.json()
  //         router.refresh()
  //       } catch(e) {
  //         console.log(e)
  //       }
  //     }
  //   }]

  //   return (
  //     <Dropdown menu={{ items: menuItems }}>
  //       <Button icon={<MoreOutlined/>} size='small'/>
  //     </Dropdown>
  //   )
  // }

  const columns: TableProps<IAgreement>['columns'] = [
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status'
    },
    {
      title: 'Missing Fields',
      align: 'center',
      render: (v,r) => {
        let missing = missingCSVData(r, props.practices, props.entities)
        return missing.length
      }
    },
    {
      title: 'Last Edit',
      dataIndex: 'updatedAt',
      render: (v) => {
        if(!v) return '-'
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: 'Draft Requested',
      dataIndex: 'draftRequested',
      align: 'center',
      render: (v) => {
        if(!v) return '-'
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: 'Drafting',
      dataIndex: 'csvDownload',
      align: 'center',
      render: (v) => {
        if(!v) return '-'
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: 'Legal Approved',
      dataIndex: 'legalApproved',
      align: 'center',
      render: (v) => {
        if(!v) return '-'
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: 'Executed',
      dataIndex: 'effectiveDate',
      align: 'center',
      render: (v, r) => {
        if(!v || r.status !== 'Executed') return '-'
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: 'Terminated',
      dataIndex: 'terminated',
      align: 'center',
      render: (v) => {
        if(!v) return '-'
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: 'Next Step',
      render: (v,r) => {
        let nextStep: NextSteps = r.status === 'Assembling Data' ? 'Request Draft'
          : r.status === 'Draft Requested' ? 'Download CSV'
          : r.status === 'Drafting' ? 'Upload Draft'
          : r.status === 'Legal Approved' ? 'Upload Final'
          : r.status === 'Executed' ? 'Terminate' 
          : null

        let missing = missingCSVData(r, props.practices, props.entities)

        let tip = r.status === 'Assembling Data' && missing.length ? `Missing ${missing.join(', ')}` : null

        let disabled = Boolean(r.status === 'Assembling Data' && missing.length)
        return !nextStep ? null : (
          <Tooltip title={tip}>
            <Button
              size='small'
              disabled={disabled}
              onClick={handleNextStep(nextStep, r._id)}
            >{nextStep}</Button>
          </Tooltip>
        )
      }
    },
    {
      title: '',
      align: 'center',
      render: (v,r) => (
        <Space >
        <Tooltip title='Edit'>
          <Button 
            icon={<EditOutlined/>} 
            size='small'
            disabled={r.status === 'Executed' || r.status === 'Terminated'}
            onClick={() => {
              setSelectedAgrId(r._id)
              setOpenModal('edit')
            }}
          />
        </Tooltip>
        <Popconfirm
          title='Are you sure?'
          description="This can't be undone"
          okText='Yes'
          onConfirm={() => handleDelete(r._id)}
        >
          <Tooltip title='Delete'>
            <Button icon={<DeleteOutlined/>} size='small' danger/>
          </Tooltip>
        </Popconfirm>
        </Space>
      )
      // render: (v,r) => {
      //   let missing = missingCSVData(r, props.practices, props.entities)
      //   return renderMenuButton(v,r,Boolean(!missing.length))
      // }
    }
  ]

  return (
    <div className='overflow-hidden'>
      <Button onClick={() => createAgreement()}>New</Button>
      <Table
        columns={columns}
        dataSource={props.agreements}
        size='small'
        rowKey={r => r._id}
      />
      <EditModal
        open={openModal === 'edit'}
        close={() => {
          setOpenModal()
          setSelectedAgrId()
        }}
        agreementId={selectedAgrId}
        practices={props.practices}
        entities={props.entities}
      />
      <UploadModal
        open={openModal === 'upload'}
        close={() => {
          setOpenModal()
          setSelectedAgrId()
        }}
        defaultType={uploadType}
        agreementId={selectedAgrId}
        practices={props.practices}
        entities={props.entities}
      />
    </div>
  )
}