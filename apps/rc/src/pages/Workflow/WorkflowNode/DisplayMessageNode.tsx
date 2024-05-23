import { useIntl }              from 'react-intl'
import { useNodeId, NodeProps } from 'reactflow'

import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseActionNode from './BaseActionNode'



export default function DisplayMessageNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()


  return <BaseActionNode {...props}>
    <div>{$t(ActionNodeDisplay.DISPLAY_MESSAGE)}</div>
  </BaseActionNode>
}
