'use client'

import { IDoctor } from '@/database/models/doctor'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'
import { TabsProps, Tabs } from 'antd'
import AgreementsTab from './tab_agreements'
import React from 'react'
import { IAgreement } from '@/database/models/agreement'
import { IPractice } from '@/database/models/practice'
import { IEntity } from '@/database/models/entity'

type Props = {
  doctor: IDoctor
  agreements: IAgreement[]
  practices: IPractice[]
  entities: IEntity[]
}

export default function DoctorDisplay({ doctor, agreements, practices, entities }: Props){
  const router = useRouter()
  const [ tab, setTab ] = React.useState<string>('profile')
 
  const tabs: TabsProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      children: null
    },
    {
      key: 'agreements',
      label: 'Agreement(s)',
      children: null
    },
    {
      key: 'employment terms',
      label: 'Terms'
    }
  ]

  return (
    <div className='flex flex-col w-screen h-screen overflow-hidden p-3'>
      <div className='border border-solid border-gray-300 rounded-md p-3 space-x-4 flex items-center mb-2'>
        <Button
          onClick={router.back}
        >Back</Button>
        <div>{`${doctor.firstName} ${doctor.lastName}`}</div>
      </div>

      <Tabs 
        defaultActiveKey='profile' 
        items={tabs}
        onChange={e => setTab(e)}
      />
      <div className='overflow-auto grow flex'>
        {tab === 'profile' ? null :
        tab === 'agreements' ? (
          <AgreementsTab 
            doctor={doctor}
            agreements={agreements}
            practices={practices}
            entities={entities}
          />
        ) :
        tab === 'employment terms' ? null :
        null}
      </div>
      
    </div>
  )
}