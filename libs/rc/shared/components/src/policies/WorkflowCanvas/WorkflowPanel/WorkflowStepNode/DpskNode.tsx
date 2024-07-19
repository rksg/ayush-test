import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { DisplayMessageIcon }              from '@acx-ui/icons'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function DpskNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  return (
    <BaseStepNode {...props}>
      {/* TODO: update icon */}
      <BasicActionContent
        icon={<DisplayMessageIcon/>}
        title={$t(ActionNodeDisplay.DPSK)}
      />
    </BaseStepNode>
  )
}
