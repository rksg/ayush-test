import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'


import { Plus } from '@acx-ui/icons'

import { useWorkflowContext } from '../WorkflowPanel/WorkflowContextProvider'

import * as UI from './styledComponents'


export function StartNode (props: NodeProps) {
  const { $t } = useIntl()
  const { actionDrawerState } = useWorkflowContext()

  const onClick = () => {
    actionDrawerState.onOpen()
  }

  return (
    <UI.StartNode {...props} onClick={onClick}>
      <Space
        direction={'horizontal'}
        align={'center'}
        size={12}
      >
        <UI.ActionTypeIcon>
          <Plus />
        </UI.ActionTypeIcon>
        {$t({ defaultMessage: 'Start building your Onboarding Workflow' })}
      </Space>
    </UI.StartNode>
  )
}
