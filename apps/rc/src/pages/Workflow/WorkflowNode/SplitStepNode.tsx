import { useIntl }              from 'react-intl'
import { NodeProps, useNodeId } from 'reactflow'

import { ActionNodeDisplay } from '@acx-ui/rc/utils'


import BaseActionNode from './BaseActionNode'

export default function SplitStepNode (props: NodeProps) {
  const { $t } = useIntl()
  const nodeId = useNodeId()
  const splitCount = ['Guest']


  return (
    <BaseActionNode splitCount={splitCount} {...props} >
    </BaseActionNode>
  )
}
