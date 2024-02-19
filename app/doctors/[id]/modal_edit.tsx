'use client'
import { IEntity } from '@/database/models/entity';
import { IPractice } from '@/database/models/practice';
import { Form, Modal, Spin } from 'antd';
import React from 'react';
import AgreementForm, { AgreementFormData, StatusListProps, getPracticeFormData } from './form_agreement';
import dayjs from 'dayjs'
import { AppContext } from '@/utils/AppContext';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean
  close: () => void
  agreementId: string|void
  practices: IPractice[]
  entities: IEntity[]
}

export default function EditModal(props: Props){
  const [ loading, setLoading ] = React.useState<boolean>(true)
  const [ initialData, setInitialData ] = React.useState<AgreementFormData>()
  const [ originalData, setOriginalData ] = React.useState<AgreementFormData>()
  const [ statusList, setStatusList ] = React.useState<StatusListProps>({})
  const { message } = React.useContext(AppContext)
  const controller = new AbortController()
  const router = useRouter()

  const [form] = Form.useForm<AgreementFormData>()
  const [oldForm] = Form.useForm<AgreementFormData>()

  React.useEffect(() => {
    if(!props.agreementId) {
      setLoading(false)
      controller.abort()
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
        form.setFieldsValue(init)
        setInitialData(init)
        if(data.oldAgreement) {
          let orig: AgreementFormData = {
            ...data.oldAgreement,
            effectiveDate: dayjs(data.oldAgreement.effectiveDate),
            ...getPracticeFormData(props.practices, data.oldAgreement.location1Practice, 1),
            ...getPracticeFormData(props.practices, data.oldAgreement.location2Practice, 2),
            ...getPracticeFormData(props.practices, data.oldAgreement.location3Practice, 3),
          }
          oldForm.setFieldsValue(orig)
          setOriginalData(orig)
        }
        setLoading(false)
      } catch(e) {
        console.log(e)
      }
    }
    fetchData(props.agreementId)

    return () => controller.abort()
  }, [props.agreementId])

  const handleSave = async () => {
    try {
      let res = await fetch('/api/agreements/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({...form.getFieldsValue(), _id: props.agreementId})
      })
      if(!res.ok) throw new Error('Error during update')
      message('Saved!', 'success')
      props.close()
      form.resetFields()
      oldForm.resetFields()
      router.refresh()
    } catch(e) {
      message('Failed to save', 'error')
    }
  }

  return (
    <Modal
      open={props.open}
      onCancel={props.close}
      destroyOnClose={true}
      okButtonProps={{
        disabled: loading
      }}
      title='Edit Agreement'
      onOk={handleSave}
      okText='Save'
      centered
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
      width={initialData && initialData.type === 'Amendment' ? '80%' : 700}
    >
      {loading && (
        <div className='p-10 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-10'>
          <Spin size='large'/>
        </div>
      )}
      {initialData?.type === 'Amendment' && (
        <div className='grow basis-0.5 overflow-y-auto pr-2' style={{ maxWidth: '50%'}}>
          <AgreementForm
            form={oldForm}
            entities={props.entities}
            practices={props.practices}
            disabled={false}
          />
        </div>
      )}
      <div className='grow basis-0.5 overflow-y-auto pr-2' style={{ maxWidth: initialData?.type === 'Amendment' ? '50%' : '100%'}}>
        <AgreementForm
          form={form}
          originalData={initialData}
          entities={props.entities}
          practices={props.practices}
          disabled={false}
          confirm={false}
          checkRequired={true}
          updateStatusList={setStatusList}
        />
      </div>
      
    </Modal>
  )
}