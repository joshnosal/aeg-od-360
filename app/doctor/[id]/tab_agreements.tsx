'use client'

import React from 'react'
import { Button, Table, TableProps, Upload, Tooltip, Dropdown, MenuProps, message } from 'antd'
import { IDoctor } from '@/database/models/doctor'
import { IAgreement } from '@/database/models/agreement'
import AgreementForm from './form_agreement'
import { IPractice } from '@/database/models/practice'
import { IEntity } from '@/database/models/entity'
import { useRouter } from 'next/navigation'
import { UploadOutlined, EditOutlined, DownloadOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons'
import UploadModal from './modal_upload'

type Props = {
  doctor: IDoctor
  agreements: IAgreement[]
  practices: IPractice[]
  entities: IEntity[]
}
type Views = 'table'|'edit'

export default function AgreementsTab({doctor, agreements, practices, entities}: Props){
  const [view, setView] = React.useState<Views>('table')
  const [ agreement, setAgreement ] = React.useState<IAgreement|void>()
  const [refresh, setRefresh] = React.useState<boolean>(false)
  const [openUpload, setOpenUpload] = React.useState<boolean>(false)
  const router = useRouter()

  React.useEffect(() => setRefresh(true), [agreements])

  React.useEffect(() => {
    if(!agreement || !refresh) return
    for(const agr of agreements) {
      if(agr._id !== agreement._id) continue
      setAgreement(agr)
      setRefresh(false)
    }
  }, [agreements, agreement, refresh])

  const createAgreement = async (type: 'Employment Agreement'|'Offer Letter'|'Amendment'|void) => {
    try {
      let res = await fetch('/api/agreements/new', {
        method: 'GET',
        headers: { doctorId: doctor._id }
      })
      if(!res.ok) throw new Error('Failed to GET')
      const data: IAgreement = await res.json()
      setAgreement(data)
    } catch(e) {
      console.log(e)
    }
    router.refresh()
  }

  const selectAgreement = (agr: IAgreement) => {
    setAgreement(agr)
    setView('edit')
  }

  

  const renderMenuButton = (v: any, r: IAgreement) => {
    const menuItems: MenuProps['items'] = [{
      key: 'edit',
      label: 'Edit',
      onClick: () => selectAgreement(r)
    }, {
      key: 'upload',
      label: 'Upload',
      onClick: () => setOpenUpload(true)
      // label: (
      // <Upload
      //   multiple={false}
      //   action={(file) => new Promise(resolve => {
      //     let reader = new FileReader()
      //     reader.onloadend = async (e) => {
      //       if(!e.target) return
      //       await fetch('/api/agreements/file_upload', {
      //         method: 'POST',
      //         headers: {
      //           'Content-Type': 'application/json',
      //           fileName: file.name,
      //           agreementId: r._id
      //         },
      //         body: JSON.stringify(e.target?.result)
      //       })
      //       router.refresh()
      //     }
      //     reader.readAsDataURL(file)
      //     return
      //   })}
      // >
      //   Upload
      // </Upload>
      // ),
    }, {
      key: 'download',
      label: 'Download',
    }, {
      key: 'delete',
      label: 'Delete',
      onClick: async () => {
        try {
          let res = await fetch('/api/agreements/delete', {
            headers: {agreementId: r._id}
          })
          if(!res.ok) throw new Error()
          router.refresh()
        } catch(e) {
          console.log(e)
        }
      }
    }]

    return (
      <Dropdown menu={{ items: menuItems }}>
        <Button icon={<MoreOutlined/>} size='small'/>
      </Dropdown>
    )
  }

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
      title: 'Last Edit',
      dataIndex: 'updatedAt',
      render: (v) => {
        let date = new Date(v)
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`
      }
    },
    {
      title: '',
      // width: 100,
      align: 'center',
      render: renderMenuButton
    }
  ]

  for(const agr of agreements){
    console.log(agr._id, agr.file)
  }

  return !agreement ? (
    <div>
      <Button
        onClick={() => createAgreement()}
      >New</Button>
      <Table
        columns={columns}
        dataSource={agreements}
        size='small'
        rowKey={r => r._id}
      />
      <UploadModal
        open={openUpload}
        close={() => setOpenUpload(false)}
      />
    </div>
  ) : (
    <AgreementForm
      agreement={agreement}
      doctor={doctor}
      practices={practices}
      entities={entities}
      clear={() => setAgreement()}
    />
  )
}