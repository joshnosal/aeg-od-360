'use client'

import { IAgreement } from '@/database/models/agreement'
import { IDoctor } from '@/database/models/doctor'
import { Button, Tabs, TabsProps } from 'antd'
import { useRouter } from 'next/navigation'
import React from 'react'
import AgreementsTab from './tab_agreements'
import { IPractice } from '@/database/models/practice'
import { IEntity } from '@/database/models/entity'

type Props = {
  agreements: IAgreement[]
  doctor: IDoctor
  practices: IPractice[]
  entities: IEntity[]
}

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

export default function DoctorsDisplay(props: Props){
  const router = useRouter()
  const [ tab, setTab ] = React.useState<string>('profile')
  
  return (
    <div className='flex flex-col overflow-hidden w-screen h-screen p-3 box-border'>
      <div className='border border-solid border-gray-300 rounded-md p-3 space-x-4 flex items-center mb-2'>
        <Button
          onClick={router.back}
        >Back</Button>
        <div>{`${props.doctor.firstName} ${props.doctor.lastName}`}</div>
      </div>

      <Tabs 
        defaultActiveKey={tab}
        items={tabs}
        onChange={e => setTab(e)}
      />
      <div className='overflow-hidden grow flex'>
        {tab === 'profile' ? null :
        tab === 'agreements' ? (
          <AgreementsTab 
            doctor={props.doctor}
            agreements={props.agreements}
            practices={props.practices}
            entities={props.entities}
          />
        ) :
        tab === 'employment terms' ? null :
        null}
      </div>

    </div>
  )
}