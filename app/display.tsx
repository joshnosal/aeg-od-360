'use client'
import { Collapse, Button, TableProps, Table } from 'antd';
import NewODModal from './modal_newOD';
import React from 'react';
import { IDoctor } from '@/database/models/doctor';
import GetComponentProps from 'antd'
import { useRouter } from 'next/navigation';

type Props = {
  doctors: IDoctor[]
}

export default function DashboardDisplay(props: Props) {
  const [ openNewModal, setOpenNewModal ] = React.useState<boolean>(false)
  const router = useRouter()

  const columns: TableProps["columns"] = [
    {
      key: 'firstName',
      dataIndex: 'firstName',
      title: 'First Name',
      width: 200
    },
    {
      key: 'lastName',
      dataIndex: 'lastName',
      title: 'Last Name',
      width: 200
    }
  ]


  return (
    <div className='flex flex-col w-screen h-screen overflow-hidden p-3 gap-3 box-border'>
      <Collapse
        size='small'
        className='w-100'
        items={[{
          key: 'filters',
          label: 'Filter / Search',
          children: (
            <div>Search Fields</div>
          )
        }]}
      />
      <Button
        className='self-start'
        type='primary'
        onClick={() => setOpenNewModal(!openNewModal)}
      >Add New</Button>
      <NewODModal
        open={openNewModal}
        close={() => setOpenNewModal(false)}
      />
      <Table
        dataSource={props.doctors}
        columns={columns}
        rowKey={r => r._id}
        onRow={(d,i) => ({
          onClick: (e) => router.push('/doctors/'+d._id)
        })}
      />
    </div>
  );
}