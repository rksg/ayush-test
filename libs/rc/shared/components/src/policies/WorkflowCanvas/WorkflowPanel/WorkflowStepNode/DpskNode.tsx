import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { DpskActionIcon }                                         from '@acx-ui/icons'
import { ActionNodeDisplay, ActionTypeDescription, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function DpskNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  return (
    <BaseStepNode {...props}>
      <BasicActionContent
        icon={<DpskActionIcon/>}
        title={$t(ActionNodeDisplay.DPSK)}
        content={
          <p>{$t(ActionTypeDescription.DPSK)}</p>
        }
      />
    </BaseStepNode>
  )
}
