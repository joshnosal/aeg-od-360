'use client'

import Doctor, { IDoctor } from '@/database/models/doctor';
import { Input, Modal } from 'antd';
import React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean,
  close: ()=>void
}

export default function NewODModal({ open, close }: Props){
  const [ values, setValues ] = React.useState<Partial<IDoctor>>({})
  const router = useRouter()

  const handleOk = async () => {
    try {
      const res = await fetch('/api/doctors/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      if(!res.ok) throw new Error('Failed to POST')
      const data: IDoctor = await res.json()
      router.push(`/doctors/${data._id}`)
      close()
    } catch(e) {
      console.log(e)
    }
    setValues({})
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      onOk={handleOk}
      okButtonProps={{
        disabled: Boolean(!values.firstName || !values.lastName)
      }}
      title='New OD'
      cancelText='Cancel'
      okText='Create OD'
      width={300}
    >
      <div className='flex flex-col gap-3'>
        <Input
          placeholder='First Name'
          value={values.firstName}
          onChange={e => setValues({ ...values, firstName: e.target.value })}
        />
        <Input
          placeholder='Last Name'
          value={values.lastName}
          onChange={e => setValues({ ...values, lastName: e.target.value })}
        />
        <Input
          placeholder='Personal Email'
          value={values.emailPersonal}
          onChange={e => setValues({ ...values, emailPersonal: e.target.value })}
        />
      </div>
    </Modal>
  )
}