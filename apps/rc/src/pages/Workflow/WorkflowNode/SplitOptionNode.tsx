import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { ActionNodeDisplay } from '@acx-ui/rc/utils'

import BaseActionNode from './BaseActionNode'

export default function SplitOptionNode (props: NodeProps) {
  const { $t } = useIntl()
  const { data } = props

  return (
    <BaseActionNode {...props}>
      {/* Use the splitStepId to determinate this Node is SplitStep or SplitOption Node */}
      {props.data?.splitStepId
        ? <>
          <div>{$t(ActionNodeDisplay.USER_SELECTION_SPLIT)}</div>
          <div>{data?.optionName}</div>
        </>
        : <>
          Split Step Node
        </>
      }
    </BaseActionNode>
  )
}
