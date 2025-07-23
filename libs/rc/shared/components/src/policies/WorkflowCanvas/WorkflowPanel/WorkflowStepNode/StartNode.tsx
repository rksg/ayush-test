import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'


import { StarterIcon } from '@acx-ui/icons'

import { useWorkflowContext } from '../WorkflowContextProvider'

import * as UI from './styledComponents'


export function StartNode (props: NodeProps) {
  const { $t } = useIntl()
  const { nodeState, actionDrawerState } = useWorkflowContext()

  const onClick = () => {
    nodeState.setInteractedNode(props)
    actionDrawerState.onOpen()
  }

  return (
    <UI.StartNode {...props} attachCandidate={props.data?.attachCandidate} onClick={onClick}>
      <Space
        direction={'horizontal'}
        align={'center'}
        size={12}
      >
        <UI.ActionTypeIcon>
          <StarterIcon />
        </UI.ActionTypeIcon>
        {$t({ defaultMessage: 'Start building your Onboarding Workflow' })}
      </Space>
    </UI.StartNode>
  )
}
