import { useIntl }              from 'react-intl'
import { NodeProps, useNodeId } from 'reactflow'

import { ActionNodeDisplay } from '@acx-ui/rc/utils'


import BaseStepNode from './BaseStepNode'

export function SplitStepNode (props: NodeProps) {
  const { $t } = useIntl()
  const nodeId = useNodeId()
  const splitCount = ['Guest']


  return (
    <BaseStepNode splitCount={splitCount} {...props} >
    </BaseStepNode>
  )
}
