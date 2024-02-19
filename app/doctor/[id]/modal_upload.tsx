'use client'
import { Modal } from 'antd';

type Props = {
  open: boolean
  close: () => void
}

export default function UploadModal(props: Props){

  return (
    <Modal
      open={props.open}
      onCancel={props.close}
    >
      <div>Upload</div>
    </Modal>
  )
}

