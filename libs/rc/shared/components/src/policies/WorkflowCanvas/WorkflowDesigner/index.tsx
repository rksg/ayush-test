import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { WorkflowPanel } from '../WorkflowPanel'

interface WorkflowDesignerProps {
  workflowId: string,
  onClose: () => void
}

export function WorkflowDesigner (props: WorkflowDesignerProps) {
  const { $t } = useIntl()
  const { workflowId, onClose } = props

  return (
    <Drawer
      visible
      title={$t({ defaultMessage: 'Workflow Designer' })}
      width={'80vw'}
      push={false}
      onClose={onClose}
    >
      <WorkflowPanel workflowId={workflowId} isEditMode={true} />
    </Drawer>
  )
}
