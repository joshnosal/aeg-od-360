'use client'

import AgreementForm, { AgreementFormData, ConfirmListProps, StatusListProps, getEntityState, getPracticeFormData } from './form_agreement';
import { IPractice } from '@/database/models/practice';
import { IEntity } from '@/database/models/entity';
import React from 'react';
import { Button, Form, Modal, Space, Spin, Upload } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { AppContext } from '@/utils/AppContext';
import { RcFile, UploadProps } from 'antd/es/upload';
const { Dragger } = Upload

type Props = {
  open: boolean
  defaultType?: 'draft'|'signed'
  close: () => void
  agreementId: string|void
  practices: IPractice[]
  entities: IEntity[]
}

export default function UploadModal(props: Props){
  const [ loading, setLoading ] = React.useState<boolean>(true)
  const [ initialData, setInitialData ] = React.useState<AgreementFormData>()
  const [ file, setFile ] = React.useState<string|ArrayBuffer|null>()
  const [ statusList, setStatusList ] = React.useState<StatusListProps>({})
  const [ agrType, setAgrType ] = React.useState<Props['defaultType']>(props.defaultType || 'draft')
  const { message } = React.useContext(AppContext)
  const [form] = Form.useForm<AgreementFormData>()
  const controller = new AbortController()
  const router = useRouter()

  React.useEffect(() => {
    if(!props.agreementId || !props.open) {
      controller.abort()
      setLoading(false)
      return
    }
    const fetchData = async (id: string) => {
      try {
        let res = await fetch('/api/agreements/details', {
          method: 'GET',
          headers: { agreementId: id },
          signal: controller.signal
        })
        if(!res.ok) throw new Error('Fetch error')
        let data = await res.json()
        form.resetFields()
        let init: AgreementFormData = {
          ...data.agreement,
          effectiveDate: dayjs(data.agreement.effectiveDate),
          ...getPracticeFormData(props.practices, data.agreement.location1Practice, 1),
          ...getPracticeFormData(props.practices, data.agreement.location2Practice, 2),
          ...getPracticeFormData(props.practices, data.agreement.location3Practice, 3),
        }
        setInitialData(init)
        form.setFieldsValue(init)
        setLoading(false)
      } catch(e) {
        console.log(e)
      }
    }
    fetchData(props.agreementId)

    return () => controller.abort()
  }, [props.agreementId, props.open])

  const handleUpload: UploadProps['action'] = (file: RcFile): Promise<string> => new Promise((r, reject) => {
    let reader = new FileReader()
    reader.onloadend = async (e) => {
      if(!e.target) return
      setFile(e.target.result)
    }
    reader.readAsDataURL(file)
    return ''
  })

  const handleSave = async () => {
    try {
      console.log('start upload')
      await fetch('/api/agreements/file_upload', {
        method: 'POST',
        headers: {
          agreementId: props.agreementId || '',
          uploadType: agrType || 'draft',
          fileName: 'Agreement Upload'
        },
        body: JSON.stringify({
          updates: form.getFieldsValue(),
          file
        })
      })
      message('Upoaded!', 'success')
      handleClose()
      router.refresh()
    } catch(e) {
      console.log(e)
    }
  }

  const isMissing = () => {
    let keys = Object.keys(statusList) as (keyof AgreementFormData) []
    for(const key of keys) if(statusList[key] === 'required' || statusList[key] === 'unconfirmed') return true
    if(!file) return false
    return false
  }

  const handleClose = () => {
    props.close()
    setAgrType(props.defaultType)
    setFile(null)
    setStatusList({})
  }

  return (
    <Modal
      open={props.open}
      onCancel={handleClose}
      okButtonProps={{
        disabled: agrType === 'signed' ? Boolean(isMissing() || !file) : !file
      }}
      onOk={handleSave}
      destroyOnClose={true}
      title='Confirm and Upload Agreement'
      styles={{
        body: {
          maxHeight: '80vh',
          overflow: 'hidden',
          paddingRight: 10,
          position: 'relative',
          display: 'flex',
          gap: 20
        },
      }}
      centered
      width={'80%'}
    >
      {loading && (
        <div className='p-10 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-10'>
          <Spin size='large'/>
        </div>
      )}
      <div className='grow basis-0.5 overflow-y-auto flex flex-col' style={{ maxWidth: '50%'}}>
          <Space className='mb-2 justify-between'>
            {file ? (
              <Upload
                multiple={false}
                action={handleUpload}
              >
                <Button type='primary' size='small'>Change File</Button>
              </Upload>
            ) : (
              <div/>
            )}
            <Space.Compact>
              <Button size='small' type={agrType === 'draft' ? 'primary' : 'default'} onClick={() => setAgrType('draft')}>Draft</Button>
              <Button size='small' type={agrType === 'signed' ? 'primary' : 'default'} onClick={() => setAgrType('signed')}>Signed</Button>
            </Space.Compact>
          </Space>
        {file ? (
          <embed src={`${file}#navpanes=0`} width='100%' className='grow' type='application/pdf'/>
        ): (
          <Dragger
            multiple={false}
            action={handleUpload}
            height={150}
          >
            Click or drag and drop to upload
          </Dragger>
        )}
      </div>
      <div className='grow basis-0.5 overflow-y-auto pr-2' style={{ maxWidth: '50%'}}>
        <AgreementForm
          form={form}
          originalData={initialData}
          entities={props.entities}
          practices={props.practices}
          confirm={file && agrType === 'signed' ? true : false}
          updateStatusList={setStatusList}
        />
      </div>
        
    </Modal>
  )
}