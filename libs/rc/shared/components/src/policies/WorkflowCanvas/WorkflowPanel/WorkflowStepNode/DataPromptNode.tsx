import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { DataPromptIcon }                  from '@acx-ui/icons'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'


export function DataPromptNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  return (
    <BaseStepNode {...props}>
      <BasicActionContent
        icon={<DataPromptIcon/>}
        title={$t(ActionNodeDisplay.DATA_PROMPT)}
      />
    </BaseStepNode>
  )
}
