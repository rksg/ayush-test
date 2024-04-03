import { useIntl }              from 'react-intl'
import { NodeProps, useNodeId } from 'reactflow'

import { ActionNodeDisplay } from '@acx-ui/rc/utils'

import BaseActionNode from './BaseActionNode'


export default function DataPromptNode (props: NodeProps) {
  const { $t } = useIntl()
  const nodeId = useNodeId()

  return (
    <BaseActionNode {...props}>
      <div>{$t(ActionNodeDisplay.DATA_PROMPT)}</div>
    </BaseActionNode>
  )
}
