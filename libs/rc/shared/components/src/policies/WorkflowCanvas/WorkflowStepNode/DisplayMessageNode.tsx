import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { DisplayMessageIcon }              from '@acx-ui/icons'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function DisplayMessageNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  return (
    <BaseStepNode {...props}>
      <BasicActionContent
        icon={<DisplayMessageIcon/>}
        title={$t(ActionNodeDisplay.DISPLAY_MESSAGE)}
      />
    </BaseStepNode>
  )
}
