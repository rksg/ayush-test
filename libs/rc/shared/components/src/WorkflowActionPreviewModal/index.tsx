import { Modal } from 'antd'

import { WorkflowStep } from '@acx-ui/rc/utils'

import * as UI                   from './styledComponents'
import { WorkflowActionPreview } from './WorkflowActionPreview'

export interface WorkflowActionPreviewModalProps {
  id: string
  step?: WorkflowStep
  onClose?: ()=>void
}

export function WorkflowActionPreviewModal (props: WorkflowActionPreviewModalProps) {
  const { id, onClose, step } = props
  return (
    <Modal
      destroyOnClose={true}
      closable={true}
      width={'100%'}
      bodyStyle={{
        padding: 0,
        height: '90%'
      }}
      visible
      className={UI.modalClassName}
      maskClosable={false}
      footer={null}
      onCancel={()=> {
        onClose?.()
      }}
    >
      <WorkflowActionPreview id={id} step={step}/>
    </Modal>
  )
}