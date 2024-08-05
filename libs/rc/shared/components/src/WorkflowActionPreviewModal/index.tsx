import { Modal } from 'antd'

import { GenericActionData, WorkflowStep } from '@acx-ui/rc/utils'

import * as UI                   from './styledComponents'
import { WorkflowActionPreview } from './WorkflowActionPreview/WorkflowActionPreview'

export interface WorkflowActionPreviewModalProps {
  workflowId: string
  step?: WorkflowStep,
  actionData?: GenericActionData,
  onClose?: ()=>void
}

export function WorkflowActionPreviewModal (props: WorkflowActionPreviewModalProps) {
  const { workflowId, onClose, step, actionData } = props
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
      <WorkflowActionPreview workflowId={workflowId} step={step} actionData={actionData}/>
    </Modal>
  )
}
